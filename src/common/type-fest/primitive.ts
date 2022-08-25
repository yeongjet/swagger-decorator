import TypeFest from 'type-fest'

export class Integer {}

export class Array {}

export const primitiveClass = [ String, Number, Boolean, Object, Array, Integer ] as const

// Ref: https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#page-17
export type PrimitiveClass = typeof primitiveClass[number]

export type Class = TypeFest.Class<any> | PrimitiveClass

export const primitiveString = [ 'string', 'number', 'boolean', 'integer', 'array', 'object' ] as const

export type PrimitiveString = typeof primitiveString[number]

export type Primitive = PrimitiveClass | PrimitiveString

export const primitive = [ ...primitiveClass, ...primitiveString ]