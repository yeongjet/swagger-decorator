import _ from 'lodash'
import { SetOptional } from 'type-fest'
import { HeaderOption, createClassMethodDecorator } from '../builder'
import { enumToArray } from '../util'
import { Enum, Schema, PrimitiveType } from '../common'

export interface ApiHeaderOption extends SetOptional<HeaderOption, 'schema'> {
    type?: PrimitiveType
    format?: string
    enum?: Enum
}

const defaultOption = {
    required: true
}

export function ApiHeader(option: ApiHeaderOption) {
    const { type, format, enum: enums, schema, ...apiParam } = { ...defaultOption, ...option }
    const header = { ...apiParam, schema: { type: 'string' } as Schema }
    if (type) {
        header.schema.type = type
        header.schema.format = format
    } else if (enums) {
        header.schema.enum = enumToArray(enums)
        header.schema.type = typeof header.schema.enum.at(0)
    } else if (schema) {
        header.schema = schema
    }
    return createClassMethodDecorator('headers', header)
}
