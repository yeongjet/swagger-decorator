import { Controller, Route, Property } from '../common'

export const getController = (): Controller => ({
    prefix: '',
    consumes: [],
    produces: [],
    headers: [],
    tags: [],
    responses: [],
    security: [],
    routes: []
})

export const getRoute = (name: Property): Route => ({
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