import _ from 'lodash'
import { Enum, Type } from '../storage'
import { enumToArray, wrapArray } from '../util'
import { createMethodDecorator } from '../builder'
import { ParameterStyle, Example, Reference, Content } from '../common/open-api'
import { SetRequired } from 'type-fest'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'

export interface ApiQueryOption {
    type?: Type
    enum?: Enum,
    isArray?: boolean
    name?: string
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

const defaultOption: SetRequired<ApiQueryOption, 'isArray'> = {
    isArray: false,
    required: true
}

export function ApiQuery(option: ApiQueryOption): MethodDecorator {
    const { type, enum: enums, isArray, ...processless } = { ...defaultOption, ...option }
    let schema = {}
    if (type) {
        schema = wrapArray(type, isArray)
    } else if (enums) {
        const { itemType, items } = enumToArray(enums)
        schema = wrapArray(itemType, isArray, items)
    }
    return createMethodDecorator({ queries: [{ ...processless, schema }] })
}
