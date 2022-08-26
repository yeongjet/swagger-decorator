import 'reflect-metadata'
import * as storage from '../storage'
import { SetOption, guard } from '../util'
import { Schema, PropertyKey } from '../common'
import { ParameterStyle, Example, Reference, Content } from '../common/open-api'
import _ from 'lodash'

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

export interface PropertyOption {
    name?: string,
    schema: Schema,
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: ParameterStyle
    explode?: boolean
    allowReserved?: boolean
    examples?: Record<string, Example | Reference>
    example?: any
    content?: Content
}

export interface HeaderOption {
    name: string
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: ParameterStyle
    explode?: boolean
    allowReserved?: boolean
    schema: Schema
    examples?: Record<string, Example | Reference>
    example?: any
    content?: Content
}

export interface ParamOption {
    name: string
    schema: Schema
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: ParameterStyle
    explode?: boolean
    allowReserved?: boolean
    examples?: Record<string, Example | Reference>
    example?: any
    content?: Content
}

export interface QueryOption {
    name?: string
    schema: Schema
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: ParameterStyle
    explode?: boolean
    allowReserved?: boolean
    examples?: Record<string, Example | Reference>
    example?: any
    content?: Content
}

export interface BodyOption {
    schema: Schema
    description?: string
    required?: boolean
}

export const createPropertyDecorator =
    (value: PropertyOption): PropertyDecorator => (...[ target, property ]: PropertyDecoratorParams) => {
        guard(_.isString(property), `property name must be string`)
        _.defaults(value.schema, { type: Reflect.getMetadata('design:type', target, property) })
        storage.setModel(target.constructor.name, property as string, [ value ])
    }

export const createMethodDecorator =
    (key: any, value: HeaderOption | ParamOption | QueryOption | { body: BodyOption }, option?: SetOption): MethodDecorator => (...[ target, property ]: MethodDecoratorParams) => {
        storage.setRoute(target.constructor.name, property, key ? [ key ]: [], [ value ], option)
    }

export const createClassMethodDecorator = (key: any, value: any, option?: SetOption): ClassDecorator & MethodDecorator => (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
    if (property) {
        storage.setRoute((target as Object).constructor.name, property, key ? [ key ]: [], [ value ], option)
    } else {
        storage.setController((target as Function).name, key ? [ key ]: [], [ value ], option)
    }
}
