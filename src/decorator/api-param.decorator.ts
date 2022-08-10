import _ from 'lodash'
import { MergeExclusive } from 'type-fest'
import { Schema, Parameter } from '../common/open-api'
import { createMethodDecorator } from '../builder'
import { enumToArray, throwError } from '../util'
import { Enum, Param } from '../common'

export type ApiParamOption = Omit<Parameter, 'schema' | 'in'> &
    MergeExclusive<
        { enum: Enum },
        { schema: Schema }
    >

const defaultOption = {
    required: true
}

export function ApiParam(option: ApiParamOption) {
    const { enum: enums, schema, ...openApiParam } = { ...defaultOption, ...option }
    const param: Param = { ...openApiParam, schema: { type: 'string' } }
    if (enums) {
        param.schema.enum = enumToArray(enums).map(toString)
    } else if (schema) {
        param.schema = schema
    } else {
        throwError('Invalid option')
    }
    return createMethodDecorator('params', param)
}
