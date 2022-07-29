import { API_EXTRA_MODELS_METADATA } from '../constant/index.js'
import { createClassAndMethodDecorator, concatMetaArray } from 'decorator-generator'

export function ApiExtraModels(...models: Function[]) {
    return createClassAndMethodDecorator(API_EXTRA_MODELS_METADATA, models, concatMetaArray)
}
