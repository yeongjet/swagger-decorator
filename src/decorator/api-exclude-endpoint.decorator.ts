import { PropertyKey } from '../interface'

export function ApiExcludeEndpoint(): MethodDecorator {
    return (target: Object, property: PropertyKey, descriptor: PropertyDescriptor) => {}
}
