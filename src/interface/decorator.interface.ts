import { Class } from 'type-fest'

class Integer {}

class Array {}

// References: https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#page-17
export type Primitive = String | Number | Boolean | Object | Date | BigInt | Array | Integer

export const primitiveClasses = [ String, Number, Boolean, Object, Date, BigInt, Array, Integer ] as const

export type PrimitiveClass = String | Number | Boolean | Object | Date | BigInt | Array | Integer

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
