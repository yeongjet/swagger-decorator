import { Property } from '../common'

export function ApiExcludeEndpoint(): MethodDecorator {
    return (target: Object, property: Property, descriptor: PropertyDescriptor) => {}
}
