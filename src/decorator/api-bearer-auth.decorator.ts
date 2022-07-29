import { ApiSecurity } from './api-security.decorator.js'

export function ApiBearerAuth() {
    return ApiSecurity('bearer')
}
