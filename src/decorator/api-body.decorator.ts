import _ from 'lodash'
import { guard, set } from '../util'
import { MethodDecoratorParams, Type, Some } from '../interface'
import { storage } from '../storage'

export interface ApiBodyOption {
    type: Some<Type>
    description?: string
    required?: boolean
}

const defaultOption: Omit<ApiBodyOption, 'type'> = {
    required: true
}

export function ApiBody(option: ApiBodyOption): MethodDecorator {
    return (...[ target, property ]: MethodDecoratorParams) => {
        guard(_.isString(property), `property key must be string`)
        set(storage, `controllers.${(target as Object).constructor.name}.handlers.${property as string}.body`, { ...defaultOption, ...option })
    }
}
