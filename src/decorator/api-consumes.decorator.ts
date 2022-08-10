import { createClassMethodDecorator } from '../builder'

export function ApiConsumes(...mimeTypes: string[]) {
    return createClassMethodDecorator('consumes', mimeTypes, { isConcat: true })
}
