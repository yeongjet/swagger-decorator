import { createApiSecurityDecorator } from '../builder'

export function ApiSecurity(name: string, requirements: string[] = []) {
    return createApiSecurityDecorator({ [name]: requirements })
}
