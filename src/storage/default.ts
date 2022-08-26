import { Storage, PropertyKey } from '../common'

export const getController = (): Storage.Controller => ({
    consumes: [],
    produces: [],
    headers: [],
    tags: [],
    responses: [],
    security: [],
    routes: []
})

export const getRoute = (name: PropertyKey): Storage.Controller.Route => ({
    name,
    consumes: [],
    produces: [],
    headers: [],
    params: [],
    queries:[],
    tags: [],
    responses: [],
    security: []
})

export const getModel = (): Storage.Model => ({
    properties: []
})

export const getProperty = (key: string): Storage.Model.Property => ({
    key,
    schema: {}
})
