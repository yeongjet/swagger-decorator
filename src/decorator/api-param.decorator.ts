import _ from 'lodash'
import { OpenApiParam, createMethodDecorator } from '../builder'
import { enumToArray } from '../util'
import { SetOptional } from 'type-fest'
import { Enum, Schema, Type } from '../common'

export interface ApiParamOption extends SetOptional<OpenApiParam, 'schema'> {
    type?: Type
    format?: string
    enum?: Enum
}

const defaultOption = {
    required: true
}

export function ApiParam(option: ApiParamOption) {
    const { type, format, enum: enums, schema, ...apiParam } = { ...defaultOption, ...option }
    const param = { ...apiParam, schema: { type: String } as Schema }
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
