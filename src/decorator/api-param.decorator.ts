import _ from 'lodash'
import { MergeExclusive } from 'type-fest'
import { Schema, Parameter, Enum } from '../common/open-api'
import { createApiParamDecorator } from '../builder'
import { enumToArray } from '../util'
import { Param } from '../common'

export type ApiParamOption = Omit<Parameter, 'schema' | 'in'> & MergeExclusive<{ enum: Enum }, { schema: Schema }>

const defaultOption: Partial<ApiParamOption> = { required: true }

export function ApiParam(option: ApiParamOption) {
    const param: Param = { ...defaultOption, ..._.omit(option, 'enum', 'schema'), in: 'path', schema: { type: 'string' } }
    if (option.enum) {
        param.schema.enum = enumToArray(option.enum).map(toString)
    } else if (option.schema) {
        param.schema = { ...param.schema, ...option.schema }
    }
    return createApiParamDecorator(param)
}
