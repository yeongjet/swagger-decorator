import { createApiConsumesDecorator } from '../builder'

export function ApiConsumes(...mimeTypes: string[]) {
    return createApiConsumesDecorator(mimeTypes)
}
