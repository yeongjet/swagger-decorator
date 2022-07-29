import _ from 'lodash'
import { Parameter, Schema } from '../open-api/open-api-spec.interface.js'
import { API_PARAMETERS_METADATA } from '../constant/index.js'
import { Enum, Type } from '../open-api/index.js'
import type { MergeExclusive } from 'type-fest'
import { createMethodDecorator, appendMetaArray } from 'decorator-generator'
import { getEnumType, getEnumArray } from '../util/index.js'

type ParameterOptions = Omit<Parameter, 'in' | 'schema'>

interface ApiParamMetadata extends ParameterOptions {
    type?: Type<unknown> | Function | [Function] | string
    format?: string
    enum?: Enum
}

interface ApiParamSchemaHost extends ParameterOptions {
    schema: Schema;
}

export type ApiParamOption = MergeExclusive<ApiParamMetadata, ApiParamSchemaHost>

const defaultOption = { required: true }

export function ApiParam(option: ApiParamOption) {
    const param = _.defaults({ ..._.omit(option, 'enum', 'schema'), in: 'path', schema: {} }, defaultOption)
    if (option.enum) {
        const enumArray = getEnumArray(option.enum)
        const enumType = getEnumType(enumArray)
        param.schema = { type: enumType, enum: enumArray }
    }
    return createMethodDecorator(API_PARAMETERS_METADATA, param, appendMetaArray)
}
