import _ from 'lodash'
import { storage } from '../storage'
import fs from 'fs'
import { OpenAPI, ParameterLocation, Reference } from '../common/open-api'
import { guard, warning, negate, merge, wrapBraceIfParam, isPrimitiveType } from '../util'
import { ParamType } from '../common'
import { Type, Storage, Schema, Parameter, ControllerRoute } from '../storage'
import { Class, PrimitiveClass } from '../common/type-fest'
import TypeFest, { Merge, SetOptional } from 'type-fest'

const openApiVersion = '3.1.0'

type UnnamedDecoratorParam = { name: undefined, in: `${ParamType}`, type: Type, required: boolean }
type NamedDecoratorParam = { name: string, in: `${ParamType}`, type: Type, required: boolean }
type RouteParamsMetadata = Omit<NamedDecoratorParam | UnnamedDecoratorParam, 'required'>
type UnnamedStorageParam = Omit<Parameter, 'name'>
type NamedStorageParam = Parameter
type NamedOpenApiParam = { name: string, in: `${ParamType}`, schema: Schema, required: boolean }
type UnnamedOpenApiParam = Omit<NamedOpenApiParam, 'name'>

export type BuildDocumentOption = {
    getPrefix?: (controllerName: string) => string
    getRoute: (controllerName: string, routeName: string) => { method: string, url: string, params?: RouteParamsMetadata[] }
}

const transformType = (type: PrimitiveClass) => {
    const schema: Record<string, any> = {}
    if (_.isDate(type)) {
        schema.type = 'string'
        schema.format = 'date-time'
    } else if (type === BigInt) {
        schema.type = 'integer'
        schema.format = 'int64'
    } else {
        const typeName = (type as Function).name
        schema.type = typeName.charAt(0).toLowerCase() + typeName.slice(1)
    }
    return schema
}

const transformSchemaType = (models: Storage['models'], param: SetOptional<NamedOpenApiParam, 'name'>) => {
    let result: any = []
    const paramType = param.schema.type
    if (isPrimitiveType(paramType)) {
        result.push({ ...param, schema: transformType(paramType) })
    } else {
        for (const property of models[(paramType as TypeFest.Class<any>).name]?.properties || []) {
            result.push({ ...param, ...property, schema: transformType(paramType) })
        }
    }
    return result
}

// routeParams: @Body() @Headers() @Param() @Query() @Body('xx') @Headers('xx') @Param('xx') @Query('xx')
// routeStorage: @ApiBody({ type: xx }) @ApiHeader({ name: 'xx' }) @ApiParam({ name: 'xx' }) @ApiQuery() @ApiQuery({ name: 'xx' })
// @ApiHeader name:必须 type: string
// @ApiParam name:必须 type:可选
// @ApiQuery name:可选 type:可选
// @ApiBody name:无 type: object

// handle @Headers() @Param() @Query() @Headers('xx') @Param('xx') @Query('xx') @ApiHeader({ name: 'xx' }) @ApiParam({ name: 'xx' }) @ApiQuery() @ApiQuery({ name: 'xx' })
const generateParameterObject = (models: Storage['models'], routeParams: RouteParamsMetadata[], routeStorage: ControllerRoute) => {
    // exclude basic type and @Body('xx')
    const validRouteParams = routeParams.filter(n => n.type !== Object && n.in !== ParamType.BODY)
        .map(n => ({ ..._.pick(n, 'name', 'in'), schema: { type: n.type }, required: true }))
    const [ unnamedRouteParams, namedRouteParams ] = _.partition(validRouteParams, n => _.isNil(n.name))  as [ UnnamedOpenApiParam[], NamedOpenApiParam[] ]
    // handle @Headers('xx') @Param('xx') @Query('xx') in routeParams

    //all @Body params will be ignore expect last one (for example: async create(@Body() createCatDto: Person, @Body() createCompanyDto: Company) => createCompanyDto will reserve
    const [ [ unnamedBodyMetadata ], unnamedQueryHeaderParamsMetadata ] = _.partition(unnamedRouteParams, { in: ParamType.BODY })
    // handle @Body()
    if (unnamedBodyMetadata && !routeStorage.body) {
        const name = (_.isFunction(unnamedBodyMetadata.schema.type) ? unnamedBodyMetadata.schema.type.name : unnamedBodyMetadata.schema.type) as string
        namedRouteParams.push({ ..._.omit(unnamedBodyMetadata, 'type'), name, schema: { type: unnamedBodyMetadata.schema.type } })
    }
    // handle @Header() @Query() @Param() in routeParams
    unnamedQueryHeaderParamsMetadata.map(n => {
        // ignore primitive type
        if (!isPrimitiveType(n.schema.type)) {
            const properties = models[(n.schema.type as TypeFest.Class<any>).name]?.properties || []
            // ignore custom type nested
            const [ customClassProperties, primitiveProperties ] = _.partition(properties, v => !isPrimitiveType(v.schema.type))
            if (!_.isEmpty(customClassProperties)) {
                warning(`properties(${customClassProperties.join(',')}) in ${(n.schema.type as TypeFest.Class<any>).name} will be ignored`)
            }
            namedRouteParams.push(...primitiveProperties.map(v => ({ name: v.name, in: n.in, schema: v.schema, required: v.required })))
        }
    })

    // all items in namedMetadataWithSchema has name, merge paramsMetadata and storageParams
    const result: NamedOpenApiParam[] = []
    const [ unnamedStorageQueries, namedStorageQueries ] = _.partition((routeStorage.queries || []), n => _.isNil(n.name)) as [ UnnamedStorageParam[], NamedStorageParam[] ]
    const namedStorageParams = [
        ...(routeStorage.params || []).map(n => ({ ...n, in: ParamType.PATH })),
        ...(routeStorage.headers || []).map(n => ({ ...n, in: ParamType.HEADERS })),
        ...namedStorageQueries.map(n => ({ ...n, in: ParamType.QUERY })),
    ] as NamedOpenApiParam[]
    // handle @ApiQuery()
    for (const unnamedStorageQuery of unnamedStorageQueries) {
        result.push(...transformSchemaType(models, { ...unnamedStorageQuery, in: ParamType.QUERY }))
    }
    // merge @ApiHeader({ name: 'xx' }) @ApiParam({ name: 'xx' }) @ApiQuery({ name: 'xx' }) into route Params
    for (const namedRouteParam of namedRouteParams) {
        if (_.find(result, { name: namedRouteParam.name, in: namedRouteParam.in })) {
            continue
        }
        const [ namedStorageParam ] = _.remove(namedStorageParams, { name: namedRouteParam.name, in: namedRouteParam.in })
        if (namedStorageParam) {
            Object.assign(namedRouteParam.schema, namedStorageParam.schema)
        }
        result.push(...transformSchemaType(models, namedRouteParam))
    }
    return result
}

// handle @ApiBody({ type: xx }) @Body() @Body('xx')
const generateRequestBody = (routeParams: RouteParamsMetadata[], routeStorageBody: ControllerRoute['body']) => {
    const validBody = routeParams.find(n => n.type !== Object && !(!_.isNil(n.name) && n.in === ParamType.BODY)) ?? routeStorageBody as any
    if (!validBody) {
        return {}
    }
    validBody.schema = { $ref:`#/components/schemas/${validBody?.type.constructor.name}` }
    return validBody
}

export const buildDocument = (option: BuildDocumentOption) => {
    const { getPrefix, getRoute } = option
    const paths = {}
    const { controllers, models } = storage
    for (const [ controllerName, controller ] of Object.entries(controllers)) {
        const { routes: routesStorage, ...global } = controller
        const routePathPrefix = getPrefix ? getPrefix(controllerName) : ''
        for (const routeStorage of routesStorage) {
            guard(_.isString(routeStorage.name), 'route name must be string')
            const routeBinding = getRoute(controllerName, routeStorage.name as string)
             const routePath = routePathPrefix + wrapBraceIfParam(routeBinding.url)
            paths[routePath] = paths[routePath] || {}
            let parameters: any[] = [], requestBody: any = {}
            if (routeBinding.params) {
                parameters = generateParameterObject(models, routeBinding.params, routeStorage)
                requestBody = generateRequestBody(routeBinding.params, routeStorage.body)
            }
            const httpMethod = routeBinding.method.toLowerCase()
            paths[routePath][httpMethod] = { parameters, requestBody }
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