import _ from 'lodash'
import { guard, set } from '../util'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'
import { storage } from '../storage'

export function ApiConsumes(...mimeTypes: string[]) {
    return (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
        guard(_.isUndefined(property) || _.isString(property), `property key must be string if exists`)
        const path = property ? `controllers.${(target as Object).constructor.name}.handlers.${property as string}.consumes` :
            `controllers.${(target as Function).name}.consumes`
        set(storage, path, mimeTypes)
    }
}
