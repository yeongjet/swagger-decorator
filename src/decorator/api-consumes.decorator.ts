import _ from 'lodash'
import { guard, set } from '../util'
import { storage } from '../storage'
import { ClassDecoratorParams, MethodDecoratorParams } from '../interface'

export function ApiConsumes(...mimeTypes: string[]) {
    return (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
        guard(_.isUndefined(property) || _.isString(property), `property key must be string`)
        const path = property ? `controllers.${(target as Object).constructor.name}.handlers.${property as string}.consumes` :
            `controllers.${(target as Function).name}.consumes`
        set(storage, path, mimeTypes)
    }
}
