import _ from 'lodash'
import * as storage from '../storage'
import fs from 'fs'
import { OpenAPI } from '../common/open-api'
import { guard, negate, merge, wrapBraceIfParam } from '../util'
import { Type, ParamType, Storage } from '../common'

const openApiVersion = '3.1.0'

type Param = { in: `${ParamType}`, type: Type, name?: string }

export type BuildDocumentOption = {
    getPrefix?: (controllerName: string) => string
    getRoute: (controllerName: string, routeName: string) => { method: string, url: string, params?: Param[] }
}

const mergeParams = (methodParams: Param[], { body, params, queries, headers }: Storage.Controller.Route) => {
    const paramsWithType: any[] = []
    // exclude basic type and @Body('xx')
    const validMethodParams = methodParams.filter(n => n.type !== Object &&  !(_.isNil(n.name) && n.in === ParamType.BODY))
        .map(n => ({ ...n, required: true }))
    const unnamedMethodParams = _.remove(validMethodParams, n => _.isNil(n.name))
    paramsWithType.push(...validMethodParams)
    for (const n of unnamedMethodParams) {
        const s = n.type
    }
    if (!body) {
        const bodyBinded = _.find(unnamedMethodParams, { in: ParamType.BODY })
        if (bodyBinded) {
            // @ts-ignore
            bodyBinded.name = _.isFunction(bodyBinded.type) ? bodyBinded.type.name : bodyBinded.type
            paramsWithType.push(bodyBinded)
        }
    }
    for (const [ key, value ] of Object.entries({ [ParamType.PATH]: params, [ParamType.QUERY]: queries, [ParamType.HEADERS]: headers })){
        for (const item of value) {
            if (!_.find(paramsWithType, { name: item.name, in: key })) {
                const paramBinded = _.find(unnamedMethodParams, { in: key, name: item.name })
                const paramAssign = paramBinded ? Object.assign(paramBinded, item) : item
                paramsWithType.push(paramAssign)
            }
        }
    }
    return paramsWithType
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
                parameters = mergeParams(routeBinding.params, route)
            }
            const httpMethod = routeBinding.method.toLowerCase()
            paths[routePath][httpMethod] = { parameters, ...merge(route, global) }
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