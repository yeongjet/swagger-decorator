import { Property } from '../common'

export function ApiHideProperty(): PropertyDecorator {
  return (target: Object, property: Property) => {}
}
