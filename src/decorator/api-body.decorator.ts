import _ from 'lodash'
import { SetOptional } from 'type-fest'
import { enumToArray, wrapArray } from '../util'
import { Enum, Type } from '../common'
import { OpenApiBody, createMethodDecorator } from '../builder'

export interface ApiBodyOption extends SetOptional<OpenApiBody, 'schema'> {
    type?: Type
    enum?: Enum
    isArray?: boolean
}

const defaultOption = {
    isArray: false
}

export function ApiBody(option: ApiBodyOption): MethodDecorator {
    const { type, enum: enums, isArray, schema, ...apiParam } = { ...defaultOption, ...option }
    const body = { ...apiParam, schema: { type: Object } } as OpenApiBody
    if (type) {
        body.schema = wrapArray(type, isArray)
    } else if (enums) {
        const { itemType, array } = enumToArray(enums)
        body.schema = wrapArray(itemType, isArray, array)
    } else if (schema) {
        body.schema = schema
    }
    return createMethodDecorator('body', body)
}
