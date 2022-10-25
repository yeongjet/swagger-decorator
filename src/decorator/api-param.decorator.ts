import _ from 'lodash'
import { guard, isPrimitive, set } from '../util'
import { storage } from '../storage'
import { MethodDecoratorParams } from '../builder'
import { Examples, ParameterStyle } from '../common/open-api'
import { Type, Enum, ParameterLocation } from '../common'

export interface ApiParamOption {
    type?: Type
    format?: string
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

const defaultOption: Partial<ApiParamOption> = {
    required: true
}

export function ApiParam(receivedOption: ApiParamOption): MethodDecorator {
    return (...[target, property]: MethodDecoratorParams) => {
        guard(_.isString(property), `property key must be string`)
        const option = { ...defaultOption, ...receivedOption }
        guard(
            (_.isString(option.name) && isPrimitive(option.type) && _.isNil(option.enum)) ||
                (_.isString(option.name) && _.isNil(option.type) && !_.isNil(option.enum)) ||
                (_.isNil(option.name) && !isPrimitive(option.type) && _.isNil(option.enum)),
            `@ApiParam option incorrect which accepts:
                1.name={string} type={Primitive} enum=undefined
                2.name={string} type=undefined enum={Enum}
                3.name=undefined type={Class} enum=undefined`
        )
        set(storage, `controllers.${(target as Object).constructor.name}.handlers.${property as string}.parameters`, [
            { in: ParameterLocation.PATH, ...option }
        ])
    }
}
