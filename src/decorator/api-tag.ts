import { createClassMethodDecorator } from '../builder'

export function ApiTags(...tags: string[]) {
    return createClassMethodDecorator({ tags })
}
