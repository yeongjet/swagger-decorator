import { Property } from 'common/type.js'

export function ApiExcludeEndpoint(): MethodDecorator {
    return (target: Object, property: Property, descriptor: PropertyDescriptor) => {}
}
