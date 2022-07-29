import { API_PRODUCES_METADATA } from '../constant/index.js'
import { createClassAndMethodDecorator, concatMetaArray } from 'decorator-generator'

export function ApiProduces(...mimeTypes: string[]) {
    return createClassAndMethodDecorator(API_PRODUCES_METADATA, mimeTypes, concatMetaArray)
}
