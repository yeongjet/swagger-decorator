import _ from 'lodash'
import * as storage from '../storage'
import fs from 'fs'
import { OpenAPI } from '../common/open-api'
import { guard, negate, merge, wrapBraceIfParam, isPrimitiveType } from '../util'
import { Type, ParamType, Storage } from '../common'
import { Class } from '../common/type-fest'

const openApiVersion = '3.1.0'

type Param = { in: `${ParamType}`, type: Class, name?: string }

export type BuildDocumentOption = {
    getPrefix?: (controllerName: string) => string
    getRoute: (controllerName: string, routeName: string) => { method: string, url: string, params?: Param[] }
}

const mergeParams = (models, params: Param[], routeStorage: Storage.Controller.Route) => {
    const paramsWithType: any[] = []
    // exclude basic type and @Body('xx')
    const validParams = params.filter(n => n.type !== Object &&  !(!_.isNil(n.name) && n.in === ParamType.BODY))
        .map(n => ({ ...n, required: true }))
    const [ unnamedParams, namedParams ] = _.partition(validParams, n => _.isNil(n.name))
    paramsWithType.push(...namedParams)
    const [ [ unnamedBody ], unnamedExceptBody ] = _.partition(unnamedParams, { in: ParamType.BODY })
    if (unnamedBody && !routeStorage.body) {
        // @ts-ignore
        unnamedBody.name = _.isFunction(unnamedBody.type) ? unnamedBody.type.name : unnamedBody.type
        paramsWithType.push(unnamedBody)
    }
    for (const n of unnamedExceptBody) {
        if (!isPrimitiveType(n.type)) {

            const t = models[n.type.name]
            paramsWithType.push(...models[n.type.constructor.name].properties.map(v => ({ ...v, ..._.omit(n, 'type') })))
        }
    }
    const result: any = []
    for (const [ key, value ] of Object.entries({ [ParamType.PATH]: routeStorage.params, [ParamType.QUERY]: routeStorage.queries, [ParamType.HEADERS]: routeStorage.headers })){
        for (const item of value) {
            if (!_.find(paramsWithType, { name: item.name, in: key })) {
                const target = _.find(paramsWithType, { in: key, name: item.name })
                const paramAssign = target ? Object.assign(target, item) : item
                result.push(paramAssign)
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