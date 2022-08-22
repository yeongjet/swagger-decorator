import _ from 'lodash'
import * as storage from '../storage'
import fs from 'fs'
import { OpenAPI } from '../common/open-api'
import { guard, negate, merge, wrapBraceIfParam } from '../util'
import { Type, ParamIn, Route } from '../common'

const openApiVersion = '3.1.0'

type Param = { in: `${ParamIn}`, type: Type, name?: string }

export type BuildDocumentOption = {
    getPrefix?: (controllerName: string) => string
    getRoute: (controllerName: string, routeName: string) => { method: string, url: string, params?: Param[] }
}

const mergeParams = (paramsBinded: Param[], { body, params, queries, headers }: Route) => {
    const paramsWithType: any[] = []
    // exclude basic type and @Body('xx')
    const validParams = paramsBinded.filter(n => n.type !== Object &&  !(_.isNil(n.name) && n.in === ParamIn.BODY))
        .map(n => ({ ...n, required: true }))
    const unnamedParams = _.remove(validParams, n => _.isNil(n.name))
    paramsWithType.push(...validParams)
    if (!body) {
        const bodyBinded = _.find(unnamedParams, { in: ParamIn.BODY })
        if (bodyBinded) {
            // @ts-ignore
            bodyBinded.name = _.isFunction(bodyBinded.type) ? bodyBinded.type.name : bodyBinded.type
            paramsWithType.push(bodyBinded)
        }
    }
    for (const [ key, value ] of Object.entries({ [ParamIn.PATH]: params, [ParamIn.QUERY]: queries, [ParamIn.HEADERS]: headers })){
        for (const item of value) {
            if (!_.find(paramsWithType, { name: item.name, in: key })) {
                const paramBinded = _.find(unnamedParams, { in: key, name: item.name })
                paramsWithType.push(paramBinded ? Object.assign(paramBinded, item) : item)
            }
        }
    }
    return paramsWithType
}

export const buildDocument = (option: BuildDocumentOption) => {
    const { getPrefix, getRoute } = option
    const paths = {}
    _.map(storage.get().controllers, ((controllerStorage, controllerName) => {
        const { routes, ...routeGlobalStorage } = controllerStorage
        const prefix = getPrefix ? getPrefix(controllerName) : ''
        _.map(routes, routeStorage => {
            guard(_.isString(routeStorage.name), 'route name must be string')
            const routeBinding = getRoute(controllerName, routeStorage.name as string)
             const fullPath = prefix + wrapBraceIfParam(routeBinding.url)
            paths[fullPath] = paths[fullPath] || {}
            let parameters: any = []
            if (routeBinding.params) {
                parameters = mergeParams(routeBinding.params, routeStorage)
            }
            paths[fullPath][routeBinding.method.toLowerCase()] = { parameters, ...merge(routeStorage, routeGlobalStorage) }
        })
    }))
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