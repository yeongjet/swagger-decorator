import { Controller, Route, Property } from '../common'

export const getController = (): Controller => ({
    name: '',
    prefix: '',
    consumes: [],
    headers: [],
    tags: [],
    responses: {},
    security: [],
    routes: []
})

export const getRoute = (name: Property): Route => ({
    name,
    consumes: [],
    headers: [],
    tags: [],
    responses: {},
    security: []
})