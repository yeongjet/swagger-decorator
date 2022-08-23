import { PropertyKey } from '../common'

export function ApiExcludeEndpoint(): MethodDecorator {
    return (target: Object, property: PropertyKey, descriptor: PropertyDescriptor) => {}
}
