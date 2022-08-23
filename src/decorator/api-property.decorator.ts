import { BaseParameter } from '../common/open-api'
import { Enum, Schema, Type } from '../common'
import { PrimitiveClass, PrimitiveString, MergeExclusive3 } from '../common/type-fest'
import { enumToArray, wrapArray } from '../util'
import { MergeExclusive, Class } from 'type-fest'
import { createPropertyDecorator } from '../builder'

// { required?: boolean } & ({ type: Class<any>, isArray?: boolean } | 
//   (Omit<BaseParameter, 'schema'> & (
//     { name: string, type: PrimitiveClass | PrimitiveString, isArray?: boolean } |
//   { name: string, enum: Enum, isArray?: boolean } |
//   { name: string, schema: Schema })))

export type ApiPropertyOption = Omit<BaseParameter, 'schema'> & 
    {
        name?: string,
        type?: Type,
        enum?: Enum,
        schema?: Schema,
        isArray?: boolean
    }

const defaultOption = {
  isArray: false,
  required: true
}

export function ApiProperty(option: ApiPropertyOption = defaultOption): PropertyDecorator {
    const { type, enum: enums, schema, isArray, ...apiParam } = { ...defaultOption, ...option }
    const property = { ...apiParam, schema: { type } as Schema }
    if (type) {
      property.schema = wrapArray(type, isArray)
    } else if (enums) {
        const array = enumToArray(enums)
        const type = typeof array[0]
        property.schema =wrapArray(type, isArray, array)
    } else if (schema) {
      property.schema = schema
    }
    return createPropertyDecorator(property)
}
