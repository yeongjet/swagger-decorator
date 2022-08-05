import _ from 'lodash'
import type { MergeExclusive } from 'type-fest'
import { Schema, Enum} from '../common/open-api'
import { enumToArray } from '../util'
import { createApiHeaderDecorator } from '../builder'
import { Header } from '../common'

type ParamOptions = {
    name: string
    description?: string
    required?: boolean
}

export type ApiHeaderOption = ParamOptions & MergeExclusive<{ enum: Enum }, { schema: Schema }>

export function ApiHeader(option: ApiHeaderOption) {
    const { name, description, required } = option
    const header: Header = { name, description, required, schema: { type: 'string' } }
    if (option.enum) {
        header.schema.enum = enumToArray(option.enum)
    } else if (option.schema) {
        header.schema = { ...header.schema, ...option.schema }
    }
    return createApiHeaderDecorator(header)
}
