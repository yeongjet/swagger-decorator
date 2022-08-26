
import { Enum, Schema, Type } from '../common'
import { enumToArray, wrapArray } from '../util'
import { SetOptional } from 'type-fest'
import { PropertyOption, createPropertyDecorator } from '../builder'

// { required?: boolean } & ({ type: Class<any>, isArray?: boolean } | 
//   (Omit<BaseParameter, 'schema'> & (
//     { name: string, type: PrimitiveClass | PrimitiveString, isArray?: boolean } |
//   { name: string, enum: Enum, isArray?: boolean } |
//   { name: string, schema: Schema })))

export interface ApiPropertyOption extends SetOptional<PropertyOption, 'schema'> {
    type?: Type,
    enum?: Enum,
    isArray?: boolean
}

const defaultOption = {
    isArray: false,
    required: true
}

export function ApiProperty(option: ApiPropertyOption = defaultOption): PropertyDecorator {
    const { type, enum: enums, isArray, schema, ...apiParam } = { ...defaultOption, ...option }
    const property: PropertyOption = { ...apiParam, schema: { type } as Schema }
    if (type) {
        property.schema = wrapArray(type, isArray)
    } else if (enums) {
        const { itemType, array } = enumToArray(enums)
        property.schema =wrapArray(itemType, isArray, array)
    } else if (schema) {
      property.schema = schema
    }
    return createPropertyDecorator(property)
}
