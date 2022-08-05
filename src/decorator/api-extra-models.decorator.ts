import { createApiExtraModelsDecorator } from '../builder'

export function ApiExtraModels(...models: Function[]) {
    return createApiExtraModelsDecorator(models)
}
