import _, { lowerCase } from 'lodash'
import * as storage from '../storage'
import fs from 'fs'
import { OpenAPI } from '../common/open-api'
import { guard, merge, wrapBraceIfParam } from '../util'
import { ParamType } from '../common'

const openApiVersion = '3.1.0'


export type BuildDocumentOption = {
    getPrefix?: (controllerName: string) => string
    getRoute: (controllerName: string, routeName: string) => { method: string, url: string, params?: { type: ParamType | number, index: number, selectKey?: string }[] }
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
            if (params) {
                
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