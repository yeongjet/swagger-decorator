import _ from 'lodash'
import { guard, set } from '../util'
import { storage } from '../storage'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'

export function ApiSecurity(name: string, requirements: string[] = []) {
    return (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
        guard(_.isUndefined(property) || _.isString(property), `property key must be string if exists`)
        const path = property ? `controllers.${(target as Object).constructor.name}.handlers.${property as string}.security` : 
            `controllers.${(target as Function).name}.security`
        set(storage, path, [{ [name]: requirements }])
    }
}

export function ApiOAuth2(scopes: string[]) {
    return ApiSecurity('oauth2', scopes)
}

export function ApiCookieAuth() {
    return ApiSecurity('cookie')
}

export function ApiBearerAuth() {
    return ApiSecurity('bearer')
}

export function ApiBasicAuth() {
    return ApiSecurity('basic')
}