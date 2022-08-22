import _ from 'lodash'
import { MergeExclusive3 } from '../common/type-fest'
import { Parameter } from '../common/open-api'
import { createClassMethodDecorator } from '../builder'
import { enumToArray } from '../util'
import { Enum, Schema, Header, PrimitiveType } from '../common'

export type ApiHeaderOption = Omit<Parameter, 'schema' | 'in'> &
    MergeExclusive3<
        { type?: PrimitiveType, format?: string},
        { enum?: Enum },
        { schema?: Schema }
    >

const defaultOption = {
    required: true
}

export function ApiHeader(option: ApiHeaderOption) {
    const { type, format, enum: enums, schema, ...apiParam } = { ...defaultOption, ...option }
    const header: Header = { ...apiParam, schema: { type: 'string' } }
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
