import _ from 'lodash'
import { guard, isPrimitiveType, set } from '../util'
import { Enum, Type, storage } from '../storage'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'
import { ExampleObject, ReferenceObject, Content } from '../common/open-api'
import { ParameterLocation } from '../common'

export interface ApiHeaderOption {
    type?: Type
    format?: string
    enum?: Enum
    name?: string
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    explode?: boolean
    allowReserved?: boolean
    examples?: Record<string, ExampleObject | ReferenceObject>
    example?: any
}

const defaultOption: Partial<ApiHeaderOption> = {
    required: true
}

export function ApiHeader(option: ApiHeaderOption) {
    return (...[target, property]: ClassDecoratorParams | MethodDecoratorParams) => {
        guard(_.isUndefined(property) || _.isString(property), `property key must be string if exists`)
        const mergeOption = { ...defaultOption, ...option }
        // TODO
        // guard(
        //     (_.isString(mergeOption.name) && isPrimitiveType(mergeOption.type)) ||
        //         (_.isNil(mergeOption.name) && !isPrimitiveType(mergeOption.type)),
        //     `@ApiHeader option incorrect: only accepts name={string} type={PrimitiveType} or name=undefined type={CustomType}`
        // )
        const path = property
            ? `controllers.${(target as Object).constructor.name}.handlers.${property as string}.parameters`
            : `controllers.${(target as Function).name}.parameters`
        set(storage, path, [{ in: ParameterLocation.HEADERS, ...mergeOption }])
    }
}
