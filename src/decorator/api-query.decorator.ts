import _ from 'lodash'
import { storage } from '../storage'
import { guard, set } from '../util'
import { ParameterStyle, Examples } from '../interface/open-api'
import { Some, Enum, Type, DecoratorParameterLocation, MethodDecoratorParams } from '../interface'
import { isPrimitive } from '../doc-builder'

export interface ApiQueryOption {
    name?: string
    type?: Some<Type>
    enum?: Enum
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

const defaultOption: ApiQueryOption = {
    required: true
}

export function ApiQuery(receivedOption: ApiQueryOption): MethodDecorator {
    return (...[target, property]: MethodDecoratorParams) => {
        guard(_.isString(property), `property key must be string`)
        const option = { ...defaultOption, ...receivedOption }
        guard(
            (_.isString(option.name) && isPrimitive(option)) ||
                (_.isNil(option.name) && !isPrimitive(option)),
            `@ApiQuery option incorrect which accepts:
                1.name={string} type={Primitive} enum=undefined
                2.name={string} type=undefined enum={Enum}
                3.name=undefined type={Class} enum=undefined`
        )
        set(storage, `controllers.${(target as Object).constructor.name}.handlers.${property as string}.parameters`, [
            { in: DecoratorParameterLocation.QUERY, ...option }
        ])
    }
}
