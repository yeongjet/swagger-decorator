import { createClassMethodDecorator } from '../builder'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'

export function ApiProduces(...mimeTypes: string[]) {
    return createClassMethodDecorator({ produces: [mimeTypes] })
}
