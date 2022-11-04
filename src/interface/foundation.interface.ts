import { Class, Constructor } from 'type-fest'

export type Some<T> = T | T[]

// References: https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#page-17
export type Primitive = Constructor<String | Number | Boolean | Date> | typeof BigInt

export type Enum = number[] | string[] | Record<number, string>

export type Type = Class<any> | Primitive
