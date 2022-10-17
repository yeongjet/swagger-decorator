import _ from 'lodash'
import { createClassMethodDecorator } from '../builder'
import { enumToArray } from '../util'
import { Enum, Schema, Type } from '../storage'
import { ParameterStyle, Example, Reference, Content } from '../common/open-api'

export interface ApiHeaderOption {
    type?: Type
    format?: string
    enum?: Enum
    name: string
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: ParameterStyle
    explode?: boolean
    allowReserved?: boolean
    examples?: Record<string, Example | Reference>
    example?: any
    content?: Content
}

const defaultOption: Partial<ApiHeaderOption> = {
    required: true
}

export function ApiHeader(option: ApiHeaderOption) {
    const { type, format, enum: enums, ...processless } = { ...defaultOption, ...option }
    let schema = {}
    if (type) {
        schema = { type, format }
    } else if (enums) {
        const { itemType, items } = enumToArray(enums)
        schema = { enum: items, type: itemType }
    }
    return createClassMethodDecorator({ headers: [ { ...processless, schema } ] })
}
