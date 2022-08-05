import { ApiSecurity } from './api-security.decorator'

export function ApiCookieAuth() {
    return ApiSecurity('cookie')
}
