import { ApiSecurity } from './api-security.decorator'

export function ApiBearerAuth() {
    return ApiSecurity('bearer')
}
