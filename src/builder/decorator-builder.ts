import 'reflect-metadata'
import { storage, Schema } from '../storage'
import { guard, merge } from '../util'
import { PropertyKey } from '../common'
import { ParameterStyle, Example, Reference, Content } from '../common/open-api/openapi-spec-v3.1.0'
import _ from 'lodash'
import { SetOptional } from 'type-fest'
// import * as defaultValue from './default-value'

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

export interface OpenApiHeader {
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

export interface OpenApiQuery {
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

export const createPropertyDecorator =
    (value: any): PropertyDecorator => (...[ target, property ]: PropertyDecoratorParams) => {
        guard(_.isString(property), `property name must be string`)
        _.defaults(value.schema, { type: Reflect.getMetadata('design:type', target, property) })
        merge(storage.models, { [target.constructor.name]: { properties: [{ name: property, ...value }]}}, [ 'name', 'name' ])
    }

export const createMethodDecorator =
    (value: any): MethodDecorator => (...[ target, property ]: MethodDecoratorParams) => {
        merge(storage.controllers, { [target.constructor.name]: { routes: [{ name: property, ...value }] } }, ['name', 'name'])
    }

export const createClassMethodDecorator = (value: any): ClassDecorator & MethodDecorator => (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
        const targetName = property ? (target as Object).constructor.name : (target as Function).name
        const targetValue = property ? { routes: [{ name: property, ...value }] } : value
        merge(storage.controllers, { [targetName]: targetValue }, ['name'])
    }
