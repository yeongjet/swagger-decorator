import _ from 'lodash'
import { MergeExclusive } from 'type-fest'
import { Parameter, Schema } from '../common/open-api'
import { createClassMethodDecorator } from '../builder'
import { enumToArray, throwError } from '../util'
import { Enum, Header } from '../common'

export type ApiHeaderOption = Omit<Parameter, 'schema' | 'in'> & 
    MergeExclusive<
        { enum: Enum },
        { schema: Schema }
    >

const defaultOption = {
    required: true
}

export function ApiHeader(option: ApiHeaderOption) {
    const { enum: enums, schema, ...openApiParam } = { ...defaultOption, ...option }
    const header: Header = { ...openApiParam, schema: { type: 'string' } }
    if (enums) {
        header.schema.enum = enumToArray(enums).map(toString)
    } else if (schema) {
        header.schema = schema
    } else {
        throwError('Invalid option')
    }
    return createClassMethodDecorator('headers', header)
}
