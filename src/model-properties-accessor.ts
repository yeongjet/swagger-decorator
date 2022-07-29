import _ from 'lodash'
import { API_MODEL_PROPERTIES_ARRAY_METADATA, METADATA_FACTORY_NAME } from './constant/index.js'
import { createApiPropertyDecorator } from './util'
import { Type } from './open-api/index.js'

export class ModelPropertiesAccessor {
    getModelProperties(prototype: Type<unknown>): string[] {
        const properties = Reflect.getMetadata(API_MODEL_PROPERTIES_ARRAY_METADATA, prototype) || []
        return properties
            .filter(_.isString)
            .filter((key: string) => key.charAt(0) === ':' && !_.isFunction(prototype[key]))
            .map((key: string) => key.slice(1))
    }

    applyMetadataFactory(prototype: Type<unknown>) {
        const classPrototype = prototype
        do {
            if (!prototype.constructor) {
                return
            }
            if (!prototype.constructor[METADATA_FACTORY_NAME]) {
                continue
            }
            const metadata = prototype.constructor[METADATA_FACTORY_NAME]()
            const properties = Object.keys(metadata)
            properties.forEach(key => {
                createApiPropertyDecorator(metadata[key], false)(classPrototype, key)
            })
        } while (
            (prototype = Reflect.getPrototypeOf(prototype) as Type<any>) &&
            prototype !== Object.prototype &&
            prototype
        )
    }
}
