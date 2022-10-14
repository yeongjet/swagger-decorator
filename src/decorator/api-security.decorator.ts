import { createClassMethodDecorator } from '../builder'

export function ApiSecurity(name: string, requirements: string[] = []) {
    return createClassMethodDecorator({ security: { [name]: requirements }})
}
