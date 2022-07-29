import _ from 'lodash'
import { API_EXTENSION_METADATA } from '../constant/index.js'
import { createClassAndMethodDecorator, assignMetaObject } from 'decorator-generator'

export function ApiExtension(key: string, properties: any) {
    if (!key.startsWith('x-')) {
        throw new Error('Extension key is not prefixed. Please ensure you prefix it with `x-`.')
    }
    return createClassAndMethodDecorator(API_EXTENSION_METADATA, { [key]: _.clone(properties) }, assignMetaObject)
}
