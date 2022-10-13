import 'reflect-metadata'
import storage from '../storage'
import { guard } from '../util'
import { PropertyKey } from '../common'
import { Schema } from '../common/storage'
import { ParameterStyle, Example, Reference, Content } from '../common/open-api'
import _ from 'lodash'
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

export interface OpenApiProperty {
    name: string,
    schema: Schema,
    description?: string
    required: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: ParameterStyle
    explode?: boolean
    allowReserved?: boolean
    examples?: Record<string, Example | Reference>
    example?: any
    content?: Content
}

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

export interface OpenApiParam {
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

export interface OpenApiBody {
    schema: Schema
    description?: string
    required?: boolean
}

export interface CreateDecoratorOption {
    isConcat: boolean
}

const defaultOption: CreateDecoratorOption = {
    isConcat: false
}

export const createPropertyDecorator =
    (value: OpenApiProperty): PropertyDecorator => (...[ target, property ]: PropertyDecoratorParams) => {
        guard(_.isString(property), `property name must be string`)
        _.defaults(value.schema, { type: Reflect.getMetadata('design:type', target, property) })
        _.merge(storage.models, { [property]: { properties: [ value ] }})
    }

export const createMethodDecorator =
    (key: any, value: OpenApiHeader | OpenApiParam | OpenApiQuery | { body: OpenApiBody }): MethodDecorator => (...[ target, property ]: MethodDecoratorParams) => {
        _.merge(storage.controllers, { [target.constructor.name]: { routes: { name: property, [key]: value } } })
    }

export const createClassMethodDecorator = (key: any, value: any, option?: CreateDecoratorOption): ClassDecorator & MethodDecorator => (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
        const { isConcat } = { ...defaultOption, ...option }
        _.merge(storage.controllers, { [target.constructor.name]: property ? { routes: { name: property, [key]: value } } : { [key]: isConcat ? [ value ] : value } })
    }
