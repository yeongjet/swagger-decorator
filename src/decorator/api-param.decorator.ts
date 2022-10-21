import _ from 'lodash'
import { createMethodDecorator } from '../builder'
import { enumToArray } from '../util'
import { Enum, Type } from '../storage'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'
import { ParameterStyle, Example, Reference, Content } from '../common/open-api'

export interface ApiParamOption {
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

const defaultOption: Partial<ApiParamOption> = {
    required: true
}

export function ApiParam(option: ApiParamOption) {
    const { type, format, enum: enums, ...processless } = { ...defaultOption, ...option }
    let schema = { type: String } as object
    if (type) {
        schema = { type, format }
    } else if (enums) {
        const { itemType, items } = enumToArray(enums)
        schema = { type: itemType, enum: items }
    }
    return createMethodDecorator({ params: [ { ...processless, schema } ] })
}
