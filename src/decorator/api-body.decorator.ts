import _ from 'lodash'
import { guard } from '../util'
import { MethodDecoratorParams } from '../builder'
import { Enum, storage } from '../storage'
import { SetRequired } from 'type-fest'
import { Class } from 'type-fest'

export interface ApiBodyOption {
    type: Class<object>
    enum?: Enum
    isArray?: boolean
    description?: string
    required?: boolean
}

const defaultOption: SetRequired<Omit<ApiBodyOption, 'type'>, 'isArray'> = {
    isArray: false,
    required: true
}

export function ApiBody(option: ApiBodyOption): MethodDecorator {
    return (...[ target, property ]: MethodDecoratorParams) => {
        guard(_.isString(property), `property key must be string`)
        _.set(storage, `controllers.${(target as Object).constructor.name}.${property as string}.body`, { ...defaultOption, ...option })
    }
}
