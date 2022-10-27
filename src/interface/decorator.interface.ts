import { Class, Constructor } from 'type-fest'

export type Some<T> = T | T[]

// References: https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#page-17
export type Primitive = Constructor<String | Number | Boolean | Date> | typeof BigInt

export type Enum = number[] | string[] | Record<number, string>

export type Type = Class<any> | Primitive

export type PropertyKey = string | symbol

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
