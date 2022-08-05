import { ApiSecurity } from './api-security.decorator'

export function ApiBasicAuth() {
    return ApiSecurity('basic')
}
