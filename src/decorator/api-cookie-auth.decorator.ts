import { ApiSecurity } from './api-security.decorator.js'

export function ApiCookieAuth() {
    return ApiSecurity('cookie')
}
