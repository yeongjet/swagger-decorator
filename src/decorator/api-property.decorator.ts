
import { Enum, Schema, Type } from '../storage'
import { enumToArray, wrapArray } from '../util'
import { SetOptional } from 'type-fest'
import { OpenApiProperty, createPropertyDecorator } from '../builder'

export interface ApiPropertyOption extends SetOptional<OpenApiProperty, 'schema' | 'name'> {
    type?: Type
    enum?: Enum
    isArray?: boolean
}

const defaultOption = {
    isArray: false,
    required: true
}

export function ApiProperty(option: ApiPropertyOption = {}): PropertyDecorator {
    const { type, enum: enums, isArray, schema, ...apiParam } = { ...defaultOption, ...option }
    const property = { ...apiParam, schema: { type } as Schema }
    if (type) {
        property.schema = wrapArray(type, isArray)
    } else if (enums) {
        const { itemType, array } = enumToArray(enums)
        property.schema = wrapArray(itemType, isArray, array)
    } else if (schema) {
      property.schema = schema
    }
    return createPropertyDecorator(property)
}
