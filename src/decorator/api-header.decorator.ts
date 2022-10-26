import _ from 'lodash'
import { guard, set } from '../util'
import { storage } from '../storage'
import { ClassDecoratorParams, MethodDecoratorParams } from '../interface'
import { Examples, ParameterStyle } from '../interface/open-api'
import { ParameterLocation, Enum, Primitive } from '../interface'

export interface ApiHeaderOption {
    name: string
    type?: Primitive
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

const defaultOption: Partial<ApiHeaderOption> = {
    required: true
}

export function ApiHeader(receivedOption: ApiHeaderOption) {
    return (...[target, property]: ClassDecoratorParams | MethodDecoratorParams) => {
        guard(_.isUndefined(property) || _.isString(property), `property key must be string`)
        const option = { ...defaultOption, ...receivedOption }
        guard(
            (_.isNil(option.type) && !_.isNil(option.enum)) ||
            (!_.isNil(option.type) && _.isNil(option.enum)),
            `@ApiHeader option incorrect which accepts:
                1.type={Primitive} enum=undefined
                2.type=undefined enum={Enum}`
        )
        const path = property
            ? `controllers.${(target as Object).constructor.name}.handlers.${property as string}.parameters`
            : `controllers.${(target as Function).name}.parameters`
        set(storage, path, [{ in: ParameterLocation.HEADERS, ...option }])
    }
}

export const ApiHeaders = (...headers: ApiHeaderOption[]) => {
    return (...params: ClassDecoratorParams | MethodDecoratorParams): any => {
        headers.forEach(header => ApiHeader(header)(...params))
    }
}
