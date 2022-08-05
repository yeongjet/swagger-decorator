import { ApiSecurity } from './api-security.decorator'

export function ApiOAuth2(scopes: string[]) {
  return ApiSecurity('oauth2', scopes)
}
