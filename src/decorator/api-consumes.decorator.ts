import { API_CONSUMES_METADATA } from '../constant/index.js'
import { createClassAndMethodDecorator, concatMetaArray } from 'decorator-generator'

export function ApiConsumes(...mimeTypes: string[]) {
    return createClassAndMethodDecorator(API_CONSUMES_METADATA, mimeTypes, concatMetaArray)
}
