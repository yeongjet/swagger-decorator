import _ from 'lodash'
import { OpenAPI } from './common/open-api'
import { set } from './util'

export const storage: OpenAPI = {
    openapi: '3.0.1',
    info: {
        title: '',
        version: ''
    },
    paths:{}
}

export const setParam = (key: string, handler: Function, param: Param) => {
    set(storage, [[ key, getDefaultController() ], 'routes', [ { handlerName: handler.name }, getDefaultRoute(handler, handler.name) ], 'injectParams'], param)
}

export const setRoute = (key: string, route: PartialRequired<Route, 'handler'>) => {
    const { handler } = route
    set(storage, [[ key, getDefaultController() ], 'routes', [ { handlerName: handler.name }, getDefaultRoute(handler, handler.name) ]], route)
}

export const setController = (key: string, value: Partial<Controller>) => {
    set(storage, [[ key, getDefaultController() ]], value)
}

export const getController = (key: string) => storage[key]

export const getControllers = () => Object.values(storage)

export const getStorage = () => storage