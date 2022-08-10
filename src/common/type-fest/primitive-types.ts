class Integer {}

class Array {}

// Ref: https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#page-17
export type PrimitiveClass = 
| String
| Number
| Boolean
| Integer
| Array
| Object

export type PrimitiveString = 
| 'string'
| 'number'
| 'boolean'
| 'integer'
| 'array'
| 'object'