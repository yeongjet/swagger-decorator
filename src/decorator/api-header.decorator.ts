import _ from 'lodash'
import { SetOptional } from 'type-fest'
import { OpenApiHeader, createClassMethodDecorator } from '../builder'
import { enumToArray } from '../util'
import { Enum, Schema, Type } from '../common'

export interface ApiHeaderOption extends SetOptional<OpenApiHeader, 'schema'> {
    type?: Type
    format?: string
    enum?: Enum
}

const defaultOption = {
    required: true
}

export function ApiHeader(option: ApiHeaderOption) {
    const { type, format, enum: enums, schema, ...apiParam } = { ...defaultOption, ...option }
    const header = { ...apiParam, schema: { type: String } as Schema }
    if (type) {
        header.schema.type = type
        header.schema.format = format
    } else if (enums) {
        const { itemType, array } = enumToArray(enums)
        header.schema.enum = array
        header.schema.type = itemType
    } else if (schema) {
        header.schema = schema
    }
    return createClassMethodDecorator('headers', header)
}
