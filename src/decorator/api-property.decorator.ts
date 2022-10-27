import _ from 'lodash'
import { guard, set } from '../util'
import { storage } from '../storage'
import { Some, Enum, Type, PropertyDecoratorParams } from '../interface'
import { Examples } from '../interface/open-api'

export interface ApiPropertyOption {
    type?: Some<Type>
    enum?: Enum
    name?: string
    required?: boolean
    examples?: Examples
    const?: any
    // (From: json-schema-validation) Validation Keywords for Numeric Instances (number and integer)
    multipleOf?: number
    maximum?: number
    exclusiveMaximum?: boolean
    minimum?: number
    exclusiveMinimum?: boolean
    // (From: json-schema-validation) Validation Keywords for Strings
    maxLength?: number
    minLength?: number
    pattern?: string
    // (From: json-schema-validation) Validation Keywords for Arrays
    maxItems?: number
    minItems?: number
    uniqueItems?: boolean
    maxContains?: number
    minContains?: number
    // (From: json-schema-validation) Validation Keywords for Objects
    maxProperties?: number
    minProperties?: number
    dependentRequired?: Record<string, string[]>
    // (From: json-schema-validation) Format
    format?: string
    // (From: json-schema-validation) Basic Meta-Data Annotations
    title?: string
    description?: string
    default?: any
    deprecated?: boolean
    // readOnly?: boolean
    // writeOnly?: boolean
}

const defaultOption: ApiPropertyOption = {
    required: true
}

export function ApiProperty(receivedOption: ApiPropertyOption = {}): PropertyDecorator {
    return (...[ target, property ]: PropertyDecoratorParams) => {
        guard(_.isString(property), `property name must be string`)
        const option = { ...defaultOption, ...receivedOption }
        guard(
                (_.isNil(option.type) && _.isNil(option.enum)) ||
                (_.isNil(option.type) && !_.isNil(option.enum)) ||
                (!_.isNil(option.type) && _.isNil(option.enum)),
            `@ApiProperty option incorrect which accepts:
                1.type=undefined enum=undefined
                2.type={Type} enum=undefined
                3.type=undefined enum={Enum}`
        )
        if (_.isNil(option.type) && _.isNil(option.enum)) {
            option.type = Reflect.getMetadata('design:type', target, property as string)
        }
        set(storage, `components.${target.constructor.name}.${property as string}`, option)
    }
}

export function ApiPropertyOptional(option: ApiPropertyOption = {}) {
    return ApiProperty({ ...option, required: false })
}

export function ApiHideProperty(): PropertyDecorator {
    return (target: Record<string, any>, propertyKey: PropertyKey) => {};
}