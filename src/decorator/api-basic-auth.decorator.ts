import { ApiSecurity } from './api-security.decorator.js'

export function ApiBasicAuth() {
    return ApiSecurity('basic')
}
