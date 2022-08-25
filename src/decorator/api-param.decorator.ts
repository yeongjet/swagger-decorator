import _ from 'lodash'
import { Parameter } from '../common/open-api'
import { ParamOption, createMethodDecorator } from '../builder'
import { enumToArray } from '../util'
import { SetOptional } from 'type-fest'
import { Enum, Schema } from '../common'
import { Primitive } from '../common/type-fest'

// Omit<Parameter, 'schema' | 'in'> & 
//     MergeExclusive3<
//         { type?: PrimitiveType, format?: string},
//         { enum?: Enum },
//         { schema?: Schema }
//     >

export interface ApiParamOption extends SetOptional<ParamOption, 'schema'> {
    type?: Primitive
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
        const { itemType, array } = enumToArray(enums)
        param.schema.enum = array
        param.schema.type = itemType
    } else if (schema) {
        param.schema = schema
    }
    return createMethodDecorator('params', param)
}
