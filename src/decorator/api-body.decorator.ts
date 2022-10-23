import _ from 'lodash'
import { guard, set } from '../util'
import { MethodDecoratorParams } from '../builder'
import { Enum, storage } from '../storage'
import { Class, SetRequired } from 'type-fest'
import { ExampleObject, ReferenceObject } from '../common/open-api'

export interface ApiBodyOption {
    type: Class<object>
    enum?: Enum
    isArray?: boolean
    description?: string
    required?: boolean
    example?: any
    examples?: Record<string, ExampleObject | ReferenceObject>
}

const defaultOption: SetRequired<Omit<ApiBodyOption, 'type'>, 'isArray'> = {
    isArray: false,
    required: true
}

export function ApiBody(option: ApiBodyOption): MethodDecorator {
    return (...[ target, property ]: MethodDecoratorParams) => {
        guard(_.isString(property), `property key must be string`)
        set(storage, `controllers.${(target as Object).constructor.name}.handlers.${property as string}.body`, { ...defaultOption, ...option })
    }
}
