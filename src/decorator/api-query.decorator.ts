// @ts-nocheck
import _ from 'lodash'
import { Parameter, Reference, Schema } from '../type/open-api-spec.interface.js'
import { Enum, Type } from '../type/index.js'
import { addEnumArraySchema, addEnumSchema, isEnumArray, isEnumDefined, createParamDecorator, getTypeIsArrayTuple } from '../util/index.js'

type ParameterOptions = Omit<Parameter, 'in' | 'schema' | 'name'>

interface ApiQueryMetadata extends ParameterOptions {
    name?: string
    type?: Type<unknown> | Function | [Function] | string
    isArray?: boolean
    enum?: Enum
    enumName?: string
}

interface ApiQuerySchemaHost extends ParameterOptions {
    name?: string
    schema: Schema | Reference
}

export type ApiQueryOptions = ApiQueryMetadata | ApiQuerySchemaHost

const defaultQueryOptions: ApiQueryOptions = {
    name: '',
    required: true
}

export function ApiQuery(options: ApiQueryOptions): MethodDecorator {
    const apiQueryMetadata = options as ApiQueryMetadata
    const [ type, isArray ] = getTypeIsArrayTuple(apiQueryMetadata.type, !!apiQueryMetadata.isArray)
    const param: ApiQueryMetadata & Record<string, any> = {
        name: _.isNil(options.name) ? defaultQueryOptions.name : options.name,
        in: 'query',
        ..._.omit(options, 'enum'),
        type
    }

    if (isEnumArray(options)) {
        addEnumArraySchema(param, options)
    } else if (isEnumDefined(options)) {
        addEnumSchema(param, options)
    }

    if (isArray) {
        param.isArray = isArray
    }

    return createParamDecorator(param, defaultQueryOptions)
}
