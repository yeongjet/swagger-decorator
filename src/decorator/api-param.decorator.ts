import _ from 'lodash'
import { guard, isPrimitiveType, set } from '../util'
import { Enum, Type, storage } from '../storage'
import { MethodDecoratorParams } from '../builder'
import { ExampleObject, ReferenceObject } from '../common/open-api'
import { ParameterLocation } from '../common'

export interface ApiParamOption {
    type: Type
    format?: string
    enum?: Enum
    name?: string
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    explode?: boolean
    allowReserved?: boolean
    example?: any
    examples?: Record<string, ExampleObject | ReferenceObject>
}

const defaultOption: Partial<ApiParamOption> = {
    required: true
}

export function ApiParam(option: ApiParamOption): MethodDecorator {
    return (...[target, property]: MethodDecoratorParams) => {
        guard(_.isString(property), `property key must be string`)
        const mergeOption = { ...defaultOption, ...option }
        // TODO
        // guard(
        //     (_.isString(mergeOption.name) && isPrimitiveType(mergeOption.type)) ||
        //         (_.isNil(mergeOption.name) && !isPrimitiveType(mergeOption.type)),
        //     `@ApiParam option incorrect: only accepts name={string} type={PrimitiveType} or name=undefined type={CustomType}`
        // )
        set(storage, `controllers.${(target as Object).constructor.name}.handlers.${property as string}.parameters`, [
            { in: ParameterLocation.PATH, ...mergeOption }
        ])
    }
}
