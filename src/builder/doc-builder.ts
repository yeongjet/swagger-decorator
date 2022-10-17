import _ from 'lodash'
import { storage } from '../storage'
import fs from 'fs'
import { OpenAPI } from '../common/open-api'
import { guard, warning, negate, merge, wrapBraceIfParam, isPrimitiveType } from '../util'
import { ParamType } from '../common'
import { Type, Storage, Schema, Parameter, ControllerRoute } from '../storage'
import { PrimitiveClass } from '../common/type-fest'
import TypeFest, { Merge, SetOptional } from 'type-fest'

const openApiVersion = '3.1.0'

type UnnamedDecoratorParam = { name: undefined, in: `${ParamType}`, type: Type, required: boolean }
type NamedDecoratorParam = { name: string, in: `${ParamType}`, type: Type, required: boolean }
type RouteParamsMetadata = Omit<NamedDecoratorParam | UnnamedDecoratorParam, 'required'>
type UnnamedStorageParam = Omit<Parameter, 'name'>
type NamedStorageParam = Parameter
type OpenApiParam = { name: string, in: `${ParamType}`, schema: Schema, required: boolean }

export type BuildDocumentOption = {
    getPrefix?: (controllerName: string) => string
    getRoute: (controllerName: string, routeName: string) => { method: string, url: string, params?: RouteParamsMetadata[] }
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
        const typeName = (type as Function).name
        result.type = typeName.charAt(0).toLowerCase() + typeName.slice(1)
    }
    return result
}

const mergeParams = (models: Storage['models'], routeParamsMetadata: RouteParamsMetadata[], routeStorage: ControllerRoute) => {
    // exclude basic type and @Body('xx')
    const validParamsMetadata = routeParamsMetadata.filter(n => n.type !== Object &&  !(!_.isNil(n.name) && n.in === ParamType.BODY))
        .map(n => ({ ..._.pick(n, 'name', 'in', 'type'), required: true }))
    const [ unnamedMetadata, namedMetadata ] = _.partition(validParamsMetadata, n => _.isNil(n.name)) as [ UnnamedDecoratorParam[], NamedDecoratorParam[] ]
    // handle @Header('xx') @Query('xx') @Param('xx') in routeParams
    const namedMetadataWithSchema: OpenApiParam[] = namedMetadata.map(n => ({ ..._.omit(n, 'type'), schema: { type: n.type } }))
    //all @Body params will be ignore expect last one (for example: async create(@Body() createCatDto: Person, @Body() createCompanyDto: Company) => createCompanyDto will reserve
    const [ [ unnamedBodyMetadata ], unnamedQueryHeaderParamsMetadata ] = _.partition(unnamedMetadata, { in: ParamType.BODY }) as [ UnnamedDecoratorParam[], UnnamedDecoratorParam[] ]
    // handle @Body()
    if (unnamedBodyMetadata && !routeStorage.body) {
        const name = (_.isFunction(unnamedBodyMetadata.type) ? unnamedBodyMetadata.type.name : unnamedBodyMetadata.type) as string
        namedMetadataWithSchema.push({ ..._.omit(unnamedBodyMetadata, 'type'), name, schema: { type: unnamedBodyMetadata.type } })
    }
    // handle @Header() @Query() @Param() in routeParams
    unnamedQueryHeaderParamsMetadata.map(n => {
        // ignore primitive type
        if (!isPrimitiveType(n.type)) {
            const properties = models[(n.type as TypeFest.Class<any>).name]?.properties || []
            // ignore custom type nested
            const [ customClassProperties, primitiveProperties ] = _.partition(properties, v => !isPrimitiveType(v.schema.type))
            if (!_.isEmpty(customClassProperties)) {
                warning(`properties(${customClassProperties.join(',')}) in ${(n.type as TypeFest.Class<any>).name} will be ignored`)
            }
            namedMetadataWithSchema.push(...primitiveProperties.map(v => ({ name: v.name, in: n.in, schema: v.schema, required: n.required })))
        }
    })

    // all items in namedMetadataWithSchema has name, merge paramsMetadata and storageParams
    const result: OpenApiParam[] = []
    const [ unnamedQueriesInRouteStorage, namedQueriesInRouteStorage ] = _.partition((routeStorage.queries || []), n => _.isNil(n.name)) as [ UnnamedStorageParam[], NamedStorageParam[] ]
    const parametersInRouteStorage = [
        ...(routeStorage.params || []).map(n => ({ ...n, in: ParamType.PATH })),
        ...namedQueriesInRouteStorage.map(n => ({ ...n, in: ParamType.QUERY })),
        ...(routeStorage.headers || []).map(n => ({ ...n, in: ParamType.HEADERS }))
    ]
    
    // @ApiHeader name 必须 type 无(always string)
    // @ApiParam name 必须 type 可选
    // @ApiQuery name 可选 type 可选
    // @ApiBody name 无 type 可选
    // handle @ApiHeader({ name: 'xx' }) @ApiParam({ name: 'xx' }) @ApiQuery({ name: 'xx' })
    for (const parameterInRouteStorage of parametersInRouteStorage) {
        if (_.find(result, { name: parameterInRouteStorage.name, in: parameterInRouteStorage.in })) {
            continue
        }
        const [ targetParamMetadata ] = _.remove(namedMetadataWithSchema, { name: parameterInRouteStorage.name, in: parameterInRouteStorage.in })
        let assignedParam = {} as any
        if (targetParamMetadata) {
            Object.assign(targetParamMetadata.schema, parameterInRouteStorage.schema)
            assignedParam = targetParamMetadata
        } else {
            assignedParam = { ...parameterInRouteStorage, in: parameterInRouteStorage.in, required: true }
        }
        const assignedSchemaType = assignedParam.schema.type
        if (isPrimitiveType(assignedSchemaType)) {
            Object.assign(assignedParam, transformSchemaType(assignedSchemaType))
            result.push(assignedParam)
        } else {
            const modelProperties = models[(assignedSchemaType as TypeFest.Class<any>).name]?.properties || []
            for (const property of modelProperties) {
                if (parameterInRouteStorage.in === ParamType.BODY) {
                    
                } else {
                    Object.assign(property, transformSchemaType(property.schema.type))
                }
            }
            result.push(...modelProperties.map(v => ({ name: v.name, in: parameterInRouteStorage.in, schema: v.schema, required: v.required })))
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