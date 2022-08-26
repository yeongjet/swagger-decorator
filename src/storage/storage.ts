import { set } from '../util'
import { PropertyKey, Storage } from '../common'
import * as defaults from './default'

// const openApiVersion = '3.1.0'
// {
//     openapi: openApiVersion,
//     info: {
//         title: '',
//         version: ''
//     },
//     paths:{}
// }
const storage: Storage = {
    models: {},
    controllers: {}
}

export const setModel = (modelName: string, propertyKey: string, values: any[], option?: any) => 
    set(storage.models, [ modelName, { properties: { key: propertyKey }} ], [ defaults.getModel(), defaults.getProperty(propertyKey), ...values ], option)

export const setRoute = (controllerName: string, routeName: PropertyKey, keys: any[], values: any[], option?: any) => 
    set(storage.controllers, [ controllerName, { routes: { name: routeName }}, ...keys ], [ defaults.getController(), defaults.getRoute(routeName), ...values ], option)

export const setController = (controllerName: string, keys: any[], values: any[], option?: any) => 
    set(storage.controllers, [ controllerName, ...keys ], [ defaults.getController(), ...values ], option)

export const get = () => storage

export const addSchemas = (schemas: Function[]) => {
    set(storage, [ 'schemas' ], [ schemas ], { isConcat: true })
}