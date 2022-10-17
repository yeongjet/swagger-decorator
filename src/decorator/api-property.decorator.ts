
import { Enum, Type } from '../storage'
import { enumToArray, wrapArray } from '../util'
import { createPropertyDecorator } from '../builder'
import { ParameterStyle, Example, Reference, Content } from '../common/open-api'
import { SetRequired } from 'type-fest'

export interface ApiPropertyOption {
    type?: Type
    enum?: Enum
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

const defaultOption: SetRequired<ApiPropertyOption, 'isArray'> = {
    isArray: false,
    required: true
}

export function ApiProperty(option: ApiPropertyOption = {}): PropertyDecorator {
    const { type, enum: enums, isArray, ...processless } = { ...defaultOption, ...option }
    let schema = {}
    if (type) {
        schema = wrapArray(type, isArray)
    } else if (enums) {
        const { itemType, items } = enumToArray(enums)
        schema = wrapArray(itemType, isArray, items)
    }
    return createPropertyDecorator({ ...processless, schema })
}
