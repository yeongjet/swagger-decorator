import _ from 'lodash'
import type { MergeExclusive } from 'type-fest'
import { API_HEADER_METADATA, API_PARAMETERS_METADATA } from '../constant/index.js'
import { Schema, Reference} from '../common/open-api/open-api-spec.interface.js'
import { Enum, PropertyKey } from '../common/open-api/index.js'
import { createClassDecorator, createMethodDecorator, appendMetaArray } from 'decorator-generator'
import { getEnumType, getEnumArray } from '../util.js'

type ParameterOptions = {
    name: string
    description?: string
    required?: boolean
}

interface ApiParamMetadata extends ParameterOptions {
    enum: Enum
}

interface ApiParamSchemaHost extends ParameterOptions {
    schema: Schema | Reference
}

export type ApiHeaderOption =  & MergeExclusive<ApiParamMetadata, ApiParamSchemaHost>

export function ApiHeader(option: ApiHeaderOption) {
    return (target: Function, key?: PropertyKey, descriptor?: PropertyDescriptor) => {
        const param = { ..._.omit(option, 'enum', 'schema'), in: 'header', schema: {} }
        if (option.enum) {
            const enumArray = getEnumArray(option.enum)
            const enumType = getEnumType(enumArray)
            param.schema = { type: enumType, enum: enumArray }
        } else if (option.schema) {
            param.schema = { ...option.schema, type: 'string' }
        }
        if (key && descriptor) {
            return createMethodDecorator(API_PARAMETERS_METADATA, param, appendMetaArray)(target, key, descriptor)
        } else {
            return createClassDecorator(API_HEADER_METADATA, param, appendMetaArray)(target)
        }
    }
}
