import _ from 'lodash'
import { BaseParameter } from '../common/open-api'
import { Enum, Schema, Type } from '../common'
import { SetOptional } from 'type-fest'
import { enumToArray, wrapArray } from '../util'
import { QueryOption, createMethodDecorator } from '../builder'
import { Primitive } from '../common/type-fest'
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
        const { itemType, array } = enumToArray(enums)
        query.schema =wrapArray(itemType, isArray, array)
    } else if (schema) {
        query.schema = schema
    }
    return createMethodDecorator('queries', query)
}
