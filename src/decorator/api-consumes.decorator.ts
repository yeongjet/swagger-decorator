import _ from 'lodash'
import { guard, set } from '../util'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'
import { storage } from '../storage'

export function ApiConsumes(...mimeTypes: string[]) {
    return (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
        guard(_.isString(property), `property key must be string`)
        if (property) {
            set(storage, `controllers.${(target as Object).constructor.name}.${property as string}.consumes`, mimeTypes)
        } else {
            set(storage, `controllers.${(target as Function).name}.${property}.consumes`, mimeTypes)
        }
    }
}
