import { Class } from 'type-fest'

export class Integer {}

export class Array {}

// References: https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#page-17
export type Primitive = String | Number | Boolean | Object | Date | BigInt | Array | Integer

export type Enum = number[] | string[] | Record<number, string>

export type Type = Class<any> | Primitive
