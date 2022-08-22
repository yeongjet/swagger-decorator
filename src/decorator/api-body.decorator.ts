import _ from 'lodash'
import { Class } from 'type-fest'
import { RequestBody } from '../common/open-api'
import { enumToArray, wrapArray } from '../util'
import { Enum, Body, Schema } from '../common'
import { MergeExclusive3 } from '../common/type-fest'
import { createMethodDecorator } from '../builder'

export type ApiBodyOption = Pick<RequestBody, 'description' | 'required'> &
    MergeExclusive3<
        { type: Class<any>; isArray?: boolean },
        { enum: Enum; isArray?: boolean },
        { schema: Schema }
    >

const defaultOption = {
    isArray: false,
    required: true
}

export function ApiBody(option: ApiBodyOption): MethodDecorator {
    const { type, enum: enums, schema, isArray, ...apiParam } = { ...defaultOption, ...option }
    const body: Body = { ...apiParam, schema: {} }
    if (type) {
        body.schema = wrapArray(type, isArray)
    } else if (enums) {
        const array = enumToArray(enums)
        const type = typeof array[0]
        body.schema = wrapArray(type, isArray, array)
    } else if (schema) {
        body.schema = schema
    }
    return createMethodDecorator(null, { body })
}
