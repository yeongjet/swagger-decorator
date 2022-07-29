import { API_TAG_METADATA } from '../constant/index.js'
import { createClassAndMethodDecorator, concatMetaArray } from 'decorator-generator'

export function ApiTags(...tags: string[]) {
    return createClassAndMethodDecorator(API_TAG_METADATA, tags, concatMetaArray)
}
