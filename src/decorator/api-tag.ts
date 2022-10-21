import { createClassMethodDecorator } from '../builder'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'

export function ApiTags(...tags: string[]) {
    return createClassMethodDecorator({ tags })
}
