import { API_TAG_METADATA } from '../constant/index.js'
import { createClassAndMethodDecorator, concatMetaArray } from '@infra/decorator-util/index.js'

export function ApiTags(...tags: string[]) {
    return createClassAndMethodDecorator(API_TAG_METADATA, tags, concatMetaArray)
}
