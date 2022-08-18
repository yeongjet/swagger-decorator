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

const mergeParams = (bindingParams: Param[], { body, params, queries, headers }: Route) => {
    const result: any[] = []
    for(const bindingParam of bindingParams) {
        const { source, type, selectKey } = bindingParam
        let obj = { in: source, type, name: selectKey, required: true }
        if (obj.type === Object) {
            continue
        }
        if (obj.name) {
            result.push(obj)
            continue
        }
        if (obj.in === 'body') {
            if (!body) {
                // TODO
                // @ts-ignore
                obj.name = _.isFunction(type) ? type.name : type
                result.push(obj)
            }
            continue
        }
        // TODO
        obj.name = 'sd'
        const total = { param: params, query: queries, header: headers }
        for (const key in total) {
            for (const item of total[key]) {
                if (_.find(result, { name: item.name, in: key })) {
                    continue
                }
                result.push(item.name === obj.name ? Object.assign(obj, item) : { ...item, in: key })
            }
        }
    }
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