import * as storage from '../storage'
import { SetOption } from '../util'
import { PropertyKey } from '../common'

export type ClassDecoratorParams = [
    target: Function
]

export type MethodDecoratorParams = [
    target: Object,
    property: PropertyKey,
    descriptor: PropertyDescriptor
]

export type PropertyDecoratorParams = [
    target: Object,
    property: PropertyKey
]

export type ParameterDecoratorParams = [
    target: Object,
    property: PropertyKey,
    parameterIndex: number
]

export const createPropertyDecorator =
    (value: any, option?: SetOption): PropertyDecorator => (...[ target, property ]: PropertyDecoratorParams) => {
        storage.setModel(target.constructor.name, property, [ value ], option)
    }

export const createMethodDecorator =
    (key: any, value: any, option?: SetOption): MethodDecorator => (...[ target, property ]: MethodDecoratorParams) => {
        storage.setRoute(target.constructor.name, property, key ? [ key ]: [], [ value ], option)
    }

export const createClassMethodDecorator = (key: any, value: any, option?: SetOption): ClassDecorator & MethodDecorator => (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
    if (property) {
        storage.setRoute((target as Object).constructor.name, property, key ? [ key ]: [], [ value ], option)
    } else {
        storage.setController((target as Function).name, key ? [ key ]: [], [ value ], option)
    }
}
