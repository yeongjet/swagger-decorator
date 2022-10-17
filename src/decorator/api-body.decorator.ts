import _ from 'lodash'
import { enumToArray, wrapArray } from '../util'
import { createMethodDecorator } from '../builder'
import { Type, Enum } from '../storage'
import { SetRequired } from 'type-fest'

export interface ApiBodyOption {
    type?: Type
    enum?: Enum
    isArray?: boolean
    description?: string
    required?: boolean
}

const defaultOption: SetRequired<ApiBodyOption, 'isArray'> = {
    isArray: false,
    required: true
}

export function ApiBody(option: ApiBodyOption): MethodDecorator {
    const { type, enum: enums, isArray, ...processless } = { ...defaultOption, ...option }
    let schema = {}
    if (type) {
        schema = wrapArray(type, isArray)
    } else if (enums) {
        const { itemType, items } = enumToArray(enums)
        schema = wrapArray(itemType, isArray, items)
    }
    return createMethodDecorator({ body: { ...processless, schema } })
}
