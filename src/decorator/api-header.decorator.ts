import _ from 'lodash'
import { MergeExclusive } from 'type-fest'
import { Parameter, Schema, Enum } from '../common/open-api'
import { createApiHeaderDecorator } from '../builder'
import { enumToArray } from '../util'
import { Header } from '../common'

export type ApiHeaderOption = Omit<Parameter, 'schema' | 'in'> & MergeExclusive<{ enum: Enum }, { schema: Schema }>

const defaultOption: Partial<ApiHeaderOption> = { required: true }

export function ApiHeader(option: ApiHeaderOption) {
    const header: Header = { ...defaultOption, ..._.omit(option, 'enum', 'schema'), schema: { type: 'string' } } as any
    if (option.enum) {
        header.schema.enum = enumToArray(option.enum).map(toString)
    } else if (option.schema) {
        header.schema = { ...header.schema, ...option.schema }
    }
    return createApiHeaderDecorator(header)
}
