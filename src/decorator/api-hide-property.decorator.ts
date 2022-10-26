import { PropertyKey } from '../interface'

export function ApiHideProperty(): PropertyDecorator {
  return (target: Record<string, any>, propertyKey: PropertyKey) => {};
}
