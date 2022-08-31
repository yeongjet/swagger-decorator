import _ from 'lodash'
import * as storage from '../storage'
import fs from 'fs'
import { OpenAPI } from '../common/open-api'
import { guard, negate, merge, wrapBraceIfParam, isCustomClass, SetOption } from '../util'
import { Type, ParamType, Storage, Schema } from '../common'
import { Class } from '../common/type-fest'
import TypeFest, { Merge, SetOptional } from 'type-fest'

const openApiVersion = '3.1.0'

type UnnamedDecoratorParam = { name: undefined, in: `${ParamType}`, type: Class, required: boolean }
type NamedDecoratorParam = { name: string, in: `${ParamType}`, type: Class, required: boolean }
type DecoratorParam = Omit<NamedDecoratorParam | UnnamedDecoratorParam, 'required'>
type UnnamedStorageParam = Merge<Storage.Param, { name: undefined }>
type NamedStorageParam = Storage.Param
type OpenApiParam = { name: string, in: `${ParamType}`, schema: Schema, required: boolean }

export type BuildDocumentOption = {
    getPrefix?: (controllerName: string) => string
    getRoute: (controllerName: string, routeName: string) => { method: string, url: string, params?: DecoratorParam[] }
}

const mergeParams = (models: Record<string, Storage.Model>, decoratorParams: DecoratorParam[], storage: Storage.Controller.Route) => {
    // exclude basic type and @Body('xx')
    const validDecoratorParams = decoratorParams.filter(n => n.type !== Object &&  !(!_.isNil(n.name) && n.in === ParamType.BODY))
        .map(n => ({ ..._.pick(n, 'name', 'in', 'type'), required: true }))
    const [ unnamedDecoratorParams, namedDecoratorParams ] = _.partition(validDecoratorParams, n => _.isNil(n.name)) as [ UnnamedDecoratorParam[], NamedDecoratorParam[] ]
    // handle @Header('xx') @Query('xx') @Param('xx')
    const transformedDecoratorParams: OpenApiParam[] = namedDecoratorParams.map(n => ({ ..._.omit(n, 'type'), schema: { type: n.type } }))
    const [ [ unnamedDecoratorBody ], unnamedDecoratorQueryHeaderParams ] = _.partition(unnamedDecoratorParams, { in: ParamType.BODY }) as [ UnnamedDecoratorParam[], UnnamedDecoratorParam[] ]
    // handle @Body()
    if (unnamedDecoratorBody && !storage.body) {
        const name = (_.isFunction(unnamedDecoratorBody.type) ? unnamedDecoratorBody.type.name : unnamedDecoratorBody.type) as string
        transformedDecoratorParams.push({ ..._.omit(unnamedDecoratorBody, 'type'), name, schema: { type: unnamedDecoratorBody.type } })
    }
    // handle @Header() @Query() @Param()
    unnamedDecoratorQueryHeaderParams.map(n => {
        // ignore Primitive type
        if (isCustomClass(n.type)) {
            const properties = models[(n.type as TypeFest.Class<any>).name]?.properties || []
            transformedDecoratorParams.push(...properties.map(v => ({ name: v.key, in: n.in, schema: v.schema, required: n.required })))
        }
    })

    // all items in transformedDecoratorParams has name so far, merge decoratorParams and storageParams
    const result: OpenApiParam[] = []
    const [ unnamedStorageQueries, namedStorageQueries ] = _.partition(storage.queries, n => _.isNil(n.name)) as [ UnnamedStorageParam[], NamedStorageParam[] ]
    const storageParams = { [ParamType.PATH]: storage.params, [ParamType.QUERY]: namedStorageQueries, [ParamType.HEADERS]: storage.headers }
    for (const [ key, value ] of Object.entries(storageParams) as [`${ParamType}`, NamedStorageParam[]][]){
        for (const item of value) {
            if (_.find(result, { name: item.name, in: key })) {
                continue
            }
            const [ targetDecoratorParam ] = _.remove(transformedDecoratorParams, { name: item.name, in: key })
            if (targetDecoratorParam) {
                Object.assign(targetDecoratorParam.schema, item.schema)
                result.push(targetDecoratorParam)
            } else {
                result.push({ ...item, in: key, required: true })
            }
        }
    }
    return result
}

export const buildDocument = (option: BuildDocumentOption) => {
    const { getPrefix, getRoute } = option
    const paths = {}
    const { controllers, models } = storage.get()
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
    fs.writeFileSync('out.json', JSON.stringify(storage.get(), null, 4))
    return 
}