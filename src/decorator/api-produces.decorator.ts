import _ from 'lodash'
import { guard, set } from '../util'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'
import { storage } from '../storage'

export function ApiProduces(...mimeTypes: string[]) {
    return (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
        guard(_.isString(property), `property key must be string`)
        const path = property ? `controllers.${(target as Object).constructor.name}.handlers.${property as string}.produces` :
            `controllers.${(target as Function).name}.produces`
        set(storage, path, mimeTypes)
    }
}
