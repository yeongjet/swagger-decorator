import _ from 'lodash'
import { BaseParameter } from '../common/open-api'
import { Enum, Schema, Type } from '../common'
import { PrimitiveClass, PrimitiveString, MergeExclusive3 } from '../common/type-fest'
import { SetOptional } from 'type-fest'
import { enumToArray, wrapArray } from '../util'
import { QueryOption, createMethodDecorator } from '../builder'

// MergeExclusive<
//     { type: Class<any>, isArray?: boolean },
//     Omit<BaseParameter, 'schema'> & MergeExclusive3<
//         { name: string, type: PrimitiveClass | PrimitiveString, isArray?: boolean },
//         { name: string, enum: Enum, isArray?: boolean },
//         { name: string, schema: Schema }
//     >
// >

export interface ApiQueryOption extends SetOptional<QueryOption, 'schema'> {
    type?: Type
    enum?: Enum,
    isArray?: boolean
}

const defaultOption = {
    isArray: false,
    required: true
}

export function ApiQuery(option: ApiQueryOption): MethodDecorator {
    const { type, enum: enums, isArray, schema, ...apiParam } = { ...defaultOption, ...option }
    const query = { ...apiParam, schema: { type: 'string' } as Schema }
    if (type) {
        query.schema = wrapArray(type, isArray)
    } else if (enums) {
        const array = enumToArray(enums)
        const type = typeof array.at(0)
        query.schema =wrapArray(type, isArray, array)
    } else if (schema) {
        query.schema = schema
    }
    return createMethodDecorator('queries', query)
}
