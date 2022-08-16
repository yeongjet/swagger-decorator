import _, { lowerCase } from 'lodash'
import * as storage from '../storage'
import fs from 'fs'
import { OpenAPI } from '../common/open-api'
import { guard, negate, merge, wrapBraceIfParam } from '../util'
import { ParamSource } from '../common'

const openApiVersion = '3.1.0'

export type BuildDocumentOption = {
    getPrefix?: (controllerName: string) => string
    getRoute: (controllerName: string, routeName: string) => { method: string, url: string, params?: { source: ParamSource, index?: number, type?: any, selectKey?: string }[] }
}

export const buildDocument = (option: BuildDocumentOption) => {
    const { getPrefix, getRoute } = option
    const paths = {}
    _.map(storage.get().controllers, ((metadata, controllerName) => {
        const { routes, ...globalMetadata } = metadata
        const prefix = getPrefix ? getPrefix(controllerName) : ''
        _.map(routes, route => {
            guard(_.isString(route.name), 'route name must be string')
            const { method, url, params } = getRoute(controllerName, route.name as string)
            const routePath = prefix + wrapBraceIfParam(url)
            paths[routePath] = paths[routePath] || {}
            paths[routePath][lowerCase(method)] = merge(route, globalMetadata)
            if (params?.length) {
                for (const param of params) {
                    const { source, index, type, selectKey } = param
                    guard(negate(_.isNil(index) && _.isNil(type)), 'one of index and type of route param must be string')
                    
                }
            }
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