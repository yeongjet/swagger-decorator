import { Controller, Route, Model, PropertyKey } from '../common'

export const getController = (): Controller => ({
    consumes: [],
    produces: [],
    headers: [],
    tags: [],
    responses: [],
    security: [],
    routes: []
})

export const getRoute = (name: PropertyKey): Route => ({
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

export const getModel = (name: PropertyKey): Model => ({
    name,
    properties: []
})