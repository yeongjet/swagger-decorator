// @ts-nocheck
import _ from 'lodash'
import type { MergeExclusive } from 'type-fest'
import { API_MODEL_PROPERTIES_METADATA } from '../constant/index.js'
import { Schema } from '../common/open-api/open-api-spec.interface.js'
import { Enum, Type, SchemaMetadata } from '../common/open-api/index.js'
import { createPropertyDecorator, getEnumArray, getEnumType } from '../util.js'

export type ApiPropertyOption = Omit<SchemaMetadata, 'enum' | 'type' | 'items'> & MergeExclusive<{
    enum?: Enum
}, { type?: Type<unknown> | Type<unknown>[] | string | Record<string, any> }>

export function ApiProperty(option: ApiPropertyOption): PropertyDecorator {
    const param: SchemaMetadata = _.omit(option, 'type', 'items', 'enum')
    if (option.enum) {
        const isEnumArray = _.isArray(option.enum)
        const enumArray = getEnumArray(option.enum)
        const enumType = getEnumType(enumArray)
        if(isEnumArray) {
            param.type = 'array'
            param.items = { type: enumType, enum: enumArray }
        } else {
            param.type = enumType
            param.enum = enumArray
        }
    }
    if (_.isArray(option.type)) {
        param.type = 'array'
        param.items = {
            type: 'array',
            items: {
                // @ts-ignore
                type: option.type[0]
            }
        }
    }
    return createPropertyDecorator(API_MODEL_PROPERTIES_METADATA, param)
}

export function ApiPropertyOptional(options: ApiPropertyOption = {}): PropertyDecorator {
    return ApiProperty({
        ...options,
        required: false
    })
}

export function ApiResponseProperty(options: Pick<ApiPropertyOption, 'type' | 'example' | 'format' | 'enum' | 'deprecated'> = {}): PropertyDecorator {
    return ApiProperty({ readOnly: true, ...options })
}
