import _ from 'lodash'
import storage from '../storage'
import fs from 'fs'
import { OpenAPI } from '../common/open-api'
import { guard, warning, negate, merge, wrapBraceIfParam, isCustomType, isPrimitiveType } from '../util'
import { ParamType } from '../common'
import { Type, Storage, Schema, Param, ControllerRoute } from '../common/storage'
import { PrimitiveClass } from '../common/type-fest'
import TypeFest, { Merge, SetOptional } from 'type-fest'

const openApiVersion = '3.1.0'

type UnnamedDecoratorParam = { name: undefined, in: `${ParamType}`, type: Type, required: boolean }
type NamedDecoratorParam = { name: string, in: `${ParamType}`, type: Type, required: boolean }
type DecoratorParam = Omit<NamedDecoratorParam | UnnamedDecoratorParam, 'required'>
type UnnamedStorageParam = Merge<Param, { name: undefined }>
type NamedStorageParam = Param
type OpenApiParam = { name: string, in: `${ParamType}`, schema: Schema, required: boolean }

export type BuildDocumentOption = {
    getPrefix?: (controllerName: string) => string
    getRoute: (controllerName: string, routeName: string) => { method: string, url: string, params?: DecoratorParam[] }
}

const transformSchemaType = (type: PrimitiveClass) => {
    const result: Record<string, any> = {}
    if (_.isDate(type)) {
        result.type = 'string'
        result.format = 'date-time'
    } else if (type === BigInt) {
        result.type = 'integer'
        result.format = 'int64'
    } else {
        const typeName = type.constructor.name
        result.type = typeName.charAt(0).toLowerCase() + typeName.slice(1)
    }
    return result
}

const mergeParams = (models: Storage['models'], decoratorParams: DecoratorParam[], route: ControllerRoute) => {
    // exclude basic type and @Body('xx')
    const validDecoratorParams = decoratorParams.filter(n => n.type !== Object &&  !(!_.isNil(n.name) && n.in === ParamType.BODY))
        .map(n => ({ ..._.pick(n, 'name', 'in', 'type'), required: true }))
    const [ unnamedDecoratorParams, namedDecoratorParams ] = _.partition(validDecoratorParams, n => _.isNil(n.name)) as [ UnnamedDecoratorParam[], NamedDecoratorParam[] ]
    // handle @Header('xx') @Query('xx') @Param('xx')
    const transformedDecoratorParams: OpenApiParam[] = namedDecoratorParams.map(n => ({ ..._.omit(n, 'type'), schema: { type: n.type } }))
    const [ [ unnamedDecoratorBody ], unnamedDecoratorQueryHeaderParams ] = _.partition(unnamedDecoratorParams, { in: ParamType.BODY }) as [ UnnamedDecoratorParam[], UnnamedDecoratorParam[] ]
    // handle @Body()
    if (unnamedDecoratorBody && !route.body) {
        const name = (_.isFunction(unnamedDecoratorBody.type) ? unnamedDecoratorBody.type.name : unnamedDecoratorBody.type) as string
        transformedDecoratorParams.push({ ..._.omit(unnamedDecoratorBody, 'type'), name, schema: { type: unnamedDecoratorBody.type } })
    }
    // handle @Header() @Query() @Param()
    unnamedDecoratorQueryHeaderParams.map(n => {
        // ignore primitive type
        if (isCustomType(n.type)) {
            const properties = models[(n.type as TypeFest.Class<any>).name]?.properties || []
            // ignore custom type nested
            const [ customClassProperties, primitiveProperties ] = _.partition(properties, v => isCustomType(v.schema.type))
            if (!_.isEmpty(customClassProperties)) {
                warning(`properties(${customClassProperties.join(',')}) in ${(n.type as TypeFest.Class<any>).name} will be ignored`)
            }
            transformedDecoratorParams.push(...primitiveProperties.map(v => ({ name: v.name, in: n.in, schema: v.schema, required: n.required })))
        }
    })

    // all items in transformedDecoratorParams has name so far, merge decoratorParams and storageParams
    // @ApiHeader({ name: 'xx' })
    const result: OpenApiParam[] = []
    const [ unnamedStorageQueries, namedStorageQueries ] = _.partition(storage.queries, n => _.isNil(n.name)) as [ UnnamedStorageParam[], NamedStorageParam[] ]
    const storageParams = {
        ...storage.params.map(n => ({ ...n, in: ParamType.PATH })),
        ...namedStorageQueries.map(n => ({ ...n, in: ParamType.QUERY })),
        ...storage.headers.map(n => ({ ...n, in: ParamType.HEADERS }))
    }
    
    // @ApiHeader name 必须 type 无(always string)
    // @ApiParam name 必须 type 可选
    // @ApiQuery name 可选 type 可选
    // @ApiBody name 无 type 可选
    // handle @ApiHeader({ name: 'xx' }) @ApiParam({ name: 'xx' }) @ApiQuery({ name: 'xx' })
    for (const storageParam of storageParams) {
        if (_.find(result, { name: storageParam.name, in: storageParam.in })) {
            continue
        }
        const [ targetDecoratorParam ] = _.remove(transformedDecoratorParams, { name: storageParam.name, in: storageParam.in })
        const assignedParam = targetDecoratorParam ? { ...targetDecoratorParam, schema: { ...targetDecoratorParam.schema, ...storageParam.schema } } : { ...storageParam, in: storageParam.in, required: true }
        const assignedParamType = assignedParam.schema.type
        if (isCustomType(assignedParam.schema.type)) {
            const properties = models[(assignedParamType as TypeFest.Class<any>).name]?.properties || []
            for (const property of properties) {
                if (storageParam.in === ParamType.BODY) {
                    
                } else {
                    Object.assign(property, transformSchemaType(property.schema.type))
                }
            }
            result.push(...properties.map(v => ({ name: v.key, in: storageParam.in, schema: v.schema, required: v.required })))
        } else {
            Object.assign(assignedParam, transformSchemaType(assignedParam.schema.type)) 
            result.push(assignedParam)
        }
    }
    return result
}

export const buildDocument = (option: BuildDocumentOption) => {
    const { getPrefix, getRoute } = option
    const paths = {}
    const { controllers, models } = storage
    for (const [ controllerName, controller ] of Object.entries(controllers)) {
        const { routes, ...global } = controller
        const routePathPrefix = getPrefix ? getPrefix(controllerName) : ''
        for (const route of routes) {
            guard(_.isString(route.name), 'route name must be string')
            const routeBinding = getRoute(controllerName, route.name as string)
             const routePath = routePathPrefix + wrapBraceIfParam(routeBinding.url)
            paths[routePath] = paths[routePath] || {}
            let parameters: any = []
            if (routeBinding.params) {
                parameters = mergeParams(models, routeBinding.params, route)
            }
            const httpMethod = routeBinding.method.toLowerCase()
            paths[routePath][httpMethod] = { parameters }
        }
    }

    const doc: OpenAPI = {
        openapi: openApiVersion,
        info: {
            title: '',
            version: ''
        },
        paths
    }
    fs.writeFileSync('out.json', JSON.stringify(storage, null, 4))
    return 
}