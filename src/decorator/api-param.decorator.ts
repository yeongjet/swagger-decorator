import _ from 'lodash'
import { Parameter } from '../common/open-api'
import { ParamOption, createMethodDecorator } from '../builder'
import { enumToArray } from '../util'
import { SetOptional } from 'type-fest'
import { Enum, Schema, PrimitiveType } from '../common'

// Omit<Parameter, 'schema' | 'in'> & 
//     MergeExclusive3<
//         { type?: PrimitiveType, format?: string},
//         { enum?: Enum },
//         { schema?: Schema }
//     >

export interface ApiParamOption extends SetOptional<ParamOption, 'schema'> {
    type?: PrimitiveType
    format?: string
    enum?: Enum
}

const defaultOption = {
    required: true
}

export function ApiParam(option: ApiParamOption) {
    const { type, format, enum: enums, schema, ...apiParam } = { ...defaultOption, ...option }
    const param = { ...apiParam, schema: { type: 'string' } as Schema }
    if (type) {
        param.schema.type = type
        param.schema.format = format
    } else if (enums) {
        param.schema.enum = enumToArray(enums)
        param.schema.type = typeof param.schema.enum.at(0)
    } else if (schema) {
        param.schema = schema
    }
    return createMethodDecorator('params', param)
}
