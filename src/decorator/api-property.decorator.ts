import _ from 'lodash'
import { storage } from '../storage'
import { guard, set } from '../util'
import { Enum, Type } from '../common'
import { Examples, ParameterStyle } from '../common/open-api'
import { PropertyDecoratorParams } from '../builder'

export interface ApiPropertyOption {
    type?: Type
    enum?: Enum
    name?: string
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: ParameterStyle
    explode?: boolean
    allowReserved?: boolean
    example?: any
    examples?: Examples
}

const defaultOption: ApiPropertyOption = {
    required: true
}

export function ApiProperty(option: ApiPropertyOption = {}): PropertyDecorator {
    return (...[ target, property ]: PropertyDecoratorParams) => {
        guard(_.isString(property), `property name must be string`)
        const type = Reflect.getMetadata('design:type', target, property as string)
        set(storage, `components.${target.constructor.name}.${property as string}`, { type, ...defaultOption, ...option })
    }
}

export function ApiPropertyOptional(option: ApiPropertyOption = {}) {
    return ApiProperty({ ...option, required: false })
}
