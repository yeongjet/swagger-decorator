import _ from 'lodash'
import { Enum, Type, storage } from '../storage'
import { guard, set } from '../util'
import { ParameterStyle, ExampleObject, ReferenceObject, Content } from '../common/open-api'
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
    examples?: Record<string, ExampleObject | ReferenceObject>
    example?: any
    content?: Content
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

export function ApiResponseProperty(
    option: Pick<ApiPropertyOption, 'type' | 'example' | 'enum' | 'deprecated'> = {}
): PropertyDecorator {
    return ApiProperty(option)
}
