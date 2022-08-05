import * as util from '../util'
import * as storage from './storage'
import * as defaults from './default'
import { Header, Route, Property } from '../common'
import { SecurityRequirement } from '../common/open-api'

const controllers = storage.get().controllers

export const set = (controllerName: string, routeName: Property, route: Partial<Route>) => {
    util.set(controllers, [ controllerName, { routes: { name: routeName }}], [ defaults.getController(), defaults.getRoute(routeName), route ])
}

export const addSecurity = (controllerName: string, routeName: Property, security: SecurityRequirement) => {
    util.set(controllers, [ controllerName, { routes: { name: routeName }}, 'security' ], [ defaults.getController(), defaults.getRoute(routeName), security ])
}

export const addConsumes = (controllerName: string, routeName: Property, consumes: string[]) => {
    util.set(controllers, [ controllerName, { routes: { name: routeName }}, 'consumes' ], [ defaults.getController(), consumes ], { isConcat: true })
}

export const addHeader = (controllerName: string, routeName: Property, header: Header) => {
    util.set(controllers, [ controllerName, { routes: { name: routeName }}, 'headers' ], [ defaults.getController(), header ])
}