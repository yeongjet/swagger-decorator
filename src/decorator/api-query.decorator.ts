import _ from 'lodash'
import { Enum, Type, storage } from '../storage'
import { guard, isPrimitiveType, set } from '../util'
import { ParameterStyle, ExampleObject, ReferenceObject, Content } from '../common/open-api'
import { MethodDecoratorParams } from '../builder'
import { ParameterLocation } from '../common'

export interface ApiQueryOption {
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
}

const defaultOption: ApiQueryOption = {
    required: true
}

export function ApiQuery(option: ApiQueryOption): MethodDecorator {
    return (...[target, property]: MethodDecoratorParams) => {
        guard(_.isString(property), `property key must be string`)
        const mergeOption = { ...defaultOption, ...option }
        guard(
            (_.isString(mergeOption.name) && isPrimitiveType(mergeOption.type)) ||
                (_.isNil(mergeOption.name) && !isPrimitiveType(mergeOption.type)),
            `@ApiQuery option incorrect: only accepts name={string} type={PrimitiveType} or name=undefined type={CustomType}`
        )
        set(storage, `controllers.${(target as Object).constructor.name}.handlers.${property as string}.parameters`, [
            {
                in: ParameterLocation.QUERY,
                ...mergeOption
            }
        ])
    }
}
