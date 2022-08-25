import _ from 'lodash'
import { SetOptional } from 'type-fest'
import { HeaderOption, createClassMethodDecorator } from '../builder'
import { enumToArray } from '../util'
import { Enum, Schema } from '../common'
import { Primitive } from '../common/type-fest'

export interface ApiHeaderOption extends SetOptional<HeaderOption, 'schema'> {
    type?: Primitive
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
        const { itemType, array } = enumToArray(enums)
        header.schema.enum = array
        header.schema.type = itemType
    } else if (schema) {
        header.schema = schema
    }
    return createClassMethodDecorator('headers', header)
}
