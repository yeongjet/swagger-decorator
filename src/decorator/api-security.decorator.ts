import { createClassMethodDecorator } from '../builder'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'

export function ApiSecurity(name: string, requirements: string[] = []) {
    return createClassMethodDecorator({ security: { [name]: requirements }})
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