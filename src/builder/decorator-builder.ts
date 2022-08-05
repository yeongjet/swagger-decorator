import * as storage from '../storage'
import { Operation, SecurityRequirement } from '../common/open-api'
import { isClassDecoration, isMethodDecoration, ClassDecoratorParams, MethodDecoratorParams } from '../util'
import { Header, Route } from '../common'

type CreateClassMethodDecorator = {
    (handler: (...handlerParams: any[]) => any): ClassDecorator & MethodDecorator
    (classDecorationHandler: (...handlerParams: ClassDecoratorParams) => any, methodDecorationHandler: (...handlerParams: MethodDecoratorParams) => any): ClassDecorator & MethodDecorator
}

const createClassMethodDecorator: CreateClassMethodDecorator = (...handlers: any[]) => 
(...params: ClassDecoratorParams | MethodDecoratorParams) => {
    if (handlers.length === 1) {
        const [ handler ] = handlers
        handler(params)
    } else if (handlers.length === 2) {
        const [ classDecorationHandler, methodDecorationHandler ] = handlers
        if (isClassDecoration(params)) {
            classDecorationHandler(...params)
        } else if (isMethodDecoration(params)){
            methodDecorationHandler(...params)
        }
    }
}

export const createApiSecurityDecorator =
    (security: SecurityRequirement) => createClassMethodDecorator((target) => {
        storage.controller.addSecurity(target.name, security)
    }, (target, property) => {
        storage.route.addSecurity(target.constructor.name, property, security)
    })

export const createApiConsumesDecorator =
    (consumes: string[]) => createClassMethodDecorator((target) => {
        storage.controller.addConsumes(target.name, consumes)
    }, (target, property) => {
        storage.route.addConsumes(target.constructor.name, property, consumes)
    })

export const createApiExtraModelsDecorator =
    (schemas: Function[]) => createClassMethodDecorator(() => {
        storage.default.addSchemas(schemas)
    })

export const createApiHeaderDecorator =
    (header: Header) => createClassMethodDecorator((target) => {
        storage.controller.addHeader(target.name, header)
    }, (target, property) => {
        storage.route.addHeader(target.constructor.name, property, header)
    })

export const createApiOperationDecorator =
    (operation: Partial<Route>) => (...[target, property, descriptor]: MethodDecoratorParams) => {
        storage.route.set(target.constructor.name, property, operation)
    }