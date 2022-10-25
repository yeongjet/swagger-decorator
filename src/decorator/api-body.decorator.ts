import _ from 'lodash'
import { guard, set } from '../util'
import { MethodDecoratorParams } from '../builder'
import { storage } from '../storage'
import { Type } from '../common/type'

export interface ApiBodyOption {
    type: Type
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
