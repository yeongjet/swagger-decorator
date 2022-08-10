import _ from 'lodash'
import { BaseParameter } from '../common/open-api'
import { Enum, Query, ClassicTypeSchema } from '../common'
import { PrimitiveClass, PrimitiveString, MergeExclusive3 } from '../common/type-fest'
import { MergeExclusive, Class } from 'type-fest'
import { enumToArray, wrapArray, throwError } from '../util'
import { createMethodDecorator } from '../builder'

export type ApiQueryOption = MergeExclusive<
    { type: Class<any>, isArray?: boolean },
    Omit<BaseParameter, 'schema'> & MergeExclusive3<
        { name: string, type: PrimitiveClass | PrimitiveString, isArray?: boolean },
        { name: string, enum: Enum, isArray?: boolean },
        { name: string, schema: ClassicTypeSchema }
    >
>

const defaultOption = {
    isArray: false,
    required: true
}

export function ApiQuery(option: ApiQueryOption): MethodDecorator {
    const { name, type, enum: enums, schema, isArray, ...openApiParam } = { ...defaultOption, ...option }
    const query: Query = { ...openApiParam, schema: {} }
    if (type) {
        query.schema = wrapArray(type, isArray)
    } else if (enums) {
        const array = enumToArray(enums)
        const type = typeof array[0]
        query.schema =wrapArray(type, isArray, array)
    } else if (schema) {
        query.schema = schema
    } else {
        throwError('Invalid option')
    }
    return createMethodDecorator('queries', query)
}
