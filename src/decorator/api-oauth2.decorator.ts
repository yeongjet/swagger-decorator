import { ApiSecurity } from './api-security.decorator.js'

export function ApiOAuth2(scopes: string[]) {
  return ApiSecurity('oauth2', scopes)
}
