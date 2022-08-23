import _ from 'lodash'
import { Class } from 'type-fest'
import { enumToArray, wrapArray } from '../util'
import { Enum, Schema } from '../common'
import { BodyOption, createMethodDecorator } from '../builder'

export interface ApiBodyOption extends BodyOption {
    type?: Class<any>
    enum?: Enum
    isArray?: boolean
}

const defaultOption = {
    isArray: false
}

export function ApiBody(option: ApiBodyOption): MethodDecorator {
    const { type, enum: enums, isArray, schema, ...apiParam } = { ...defaultOption, ...option }
    const body = { ...apiParam, schema: {} }
    if (type) {
        body.schema = wrapArray(type, isArray)
    } else if (enums) {
        const array = enumToArray(enums)
        const type = typeof array.at(0)
        body.schema = wrapArray(type, isArray, array)
    } else if (schema) {
        body.schema = schema
    }
    return createMethodDecorator('body', body)
}
