import { createClassMethodDecorator } from '../builder'

export function ApiProduces(...mimeTypes: string[]) {
    return createClassMethodDecorator({ produces: [mimeTypes] })
}
