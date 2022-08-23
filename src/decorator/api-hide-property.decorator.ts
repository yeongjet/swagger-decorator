import { PropertyKey } from '../common'

export function ApiHideProperty(): PropertyDecorator {
  return (target: Record<string, any>, propertyKey: PropertyKey) => {};
}
