import _ from 'lodash'
import * as storage from '../storage'
import fs from 'fs'
import { OpenAPI } from '../common/open-api'
import { guard, negate, merge, wrapBraceIfParam, isCustomClass } from '../util'
import { Type, ParamType, Storage, Schema } from '../common'
import { Class } from '../common/type-fest'
import TypeFest from 'type-fest'

const openApiVersion = '3.1.0'

type UnnamedParam = { name: undefined, in: `${ParamType}`, type: Class, required: boolean }
type NamedParam = { name: string, in: `${ParamType}`, type: Class, required: boolean }
type Param = Omit<NamedParam | UnnamedParam, 'required'>
type OpenApiParam = { name: string, in: `${ParamType}`, schema: Schema, required: boolean }

export type BuildDocumentOption = {
    getPrefix?: (controllerName: string) => string
    getRoute: (controllerName: string, routeName: string) => { method: string, url: string, params?: Param[] }
}

const mergeParams = (models: Record<string, Storage.Model>, params: Param[], routeStorage: Storage.Controller.Route) => {
    // exclude basic type and @Body('xx')
    const validParams = params.filter(n => n.type !== Object &&  !(!_.isNil(n.name) && n.in === ParamType.BODY))
        .map(n => ({ ..._.pick(n, 'in', 'type', 'name'), required: true }))
    const [ unnamedParams, namedParams ]  = _.partition(validParams, n => _.isNil(n.name)) as [ UnnamedParam[], NamedParam[] ]
    const openApiParams: OpenApiParam[] = namedParams.map(n => ({ ..._.omit(n, 'type'), schema: { type: n.type } }))
    const [ [ unnamedBody ], unnamedExceptBody ] = _.partition(unnamedParams, { in: ParamType.BODY }) as [ UnnamedParam[], UnnamedParam[] ]
    if (unnamedBody && !routeStorage.body) {
        const name = (_.isFunction(unnamedBody.type) ? unnamedBody.type.name : unnamedBody.type) as string
        openApiParams.push({ ..._.omit(unnamedBody, 'type'), name, schema: { type: unnamedBody.type } })
    }
    const namedPrimitiveExceptBody = _.flatMap(unnamedExceptBody.filter(n => isCustomClass(n.type)), n => {
        const properties = models[(n.type as TypeFest.Class<any>).name]?.properties || []
        return properties.map(v => ({ name: v.key, in: n.in, schema: v.schema, required: n.required }))
    })
    openApiParams.push(...namedPrimitiveExceptBody)
    const result: OpenApiParam[] = []
    for (const [ key, value ] of Object.entries({ [ParamType.PATH]: routeStorage.params, [ParamType.QUERY]: routeStorage.queries, [ParamType.HEADERS]: routeStorage.headers })){
        for (const item of value) {
            if (!_.find(openApiParams, { name: item.name, in: key })) {
                const target = _.find(openApiParams, { in: key, name: item.name })
                
                result.push(target ? Object.assign(target, item) : { ...item, in: key })
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