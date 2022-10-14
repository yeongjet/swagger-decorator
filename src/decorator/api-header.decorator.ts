import _ from 'lodash'
import { SetOptional } from 'type-fest'
import { OpenApiHeader, createClassMethodDecorator } from '../builder'
import { enumToArray } from '../util'
import { Enum, Schema, Type } from '../storage'

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
    const headers = { ...apiParam, schema: { type: String } as Schema }
    if (type) {
        headers.schema.type = type
        headers.schema.format = format
    } else if (enums) {
        const { itemType, array } = enumToArray(enums)
        headers.schema.enum = array
        headers.schema.type = itemType
    } else if (schema) {
        headers.schema = schema
    }
    return createClassMethodDecorator({ headers: [ headers ] })
}
