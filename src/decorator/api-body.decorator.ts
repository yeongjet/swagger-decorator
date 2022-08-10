import _ from 'lodash'
import { Class } from 'type-fest'
import { RequestBody } from '../common/open-api'
import { enumToArray, wrapArray, throwError } from '../util'
import { Enum, Body, ClassicTypeSchema } from '../common'
import { MergeExclusive3 } from '../common/type-fest'
import { createMethodDecorator } from '../builder'

export type ApiBodyOption = Pick<RequestBody, 'description' | 'required'> &
    MergeExclusive3<
        { type: Class<any>; isArray?: boolean },
        { enum: Enum; isArray?: boolean },
        { schema: ClassicTypeSchema }
    >

const defaultOption = {
    isArray: false,
    required: true
}

export function ApiBody(option: ApiBodyOption): MethodDecorator {
    const { type, enum: enums, schema, isArray, ...openApiParam } = { ...defaultOption, ...option }
    const body: Body = { ...openApiParam, schema: {} }
    if (type) {
        body.schema = wrapArray(type, isArray)
    } else if (enums) {
        const array = enumToArray(enums)
        const type = typeof array[0]
        body.schema = wrapArray(type, isArray, array)
    } else if (schema) {
        body.schema = schema
    } else {
        throwError('Invalid option')
    }
    return createMethodDecorator(null, { body })
}
