import _ from 'lodash'
import * as storage from '../storage'
import fs from 'fs'
import { OpenAPI } from '../common/open-api'
import { guard, negate, merge, wrapBraceIfParam } from '../util'
import { Type, ParamSource, Route } from '../common'

const openApiVersion = '3.1.0'

type Param = { source: `${ParamSource}`, type: Type, selectKey?: string }

export type BuildDocumentOption = {
    getPrefix?: (controllerName: string) => string
    getRoute: (controllerName: string, routeName: string) => { method: string, url: string, params?: Param[] }
}

const mergeParams = (paramsBinded: Param[], { body, params, queries, headers }: Route) => {
    const result: any[] = []
    const validParams = paramsBinded.filter(n => n.type !== Object)
        .map(({ source, type, selectKey }) => ({ in: source, type, name: selectKey, required: true }))
    const unnamedParams = _.remove(validParams, n => _.isNil(n.name))
    const namedParams = validParams
    result.push(...namedParams)
    if (!body) {
        const bodyBinded = _.find(unnamedParams, { in: ParamSource.BODY })
        if (bodyBinded) {
            const { type } = bodyBinded
            // @ts-ignore
            bodyBinded.name = _.isFunction(type) ? type.name : type
            result.push(bodyBinded)
        }
    }
    _.map({ [ParamSource.PARAM]: params, [ParamSource.QUERY]: queries, [ParamSource.HEADERS]: headers }, (items, key) => _.map(items, item => {
        // TODO
        if (!_.find(result, { name: item.name, in: key })) {
            const paramBinded = _.find(unnamedParams, { in: key, name: item.name })
            result.push(paramBinded ? Object.assign(paramBinded, item) : item)
        }
    }))
    return result
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