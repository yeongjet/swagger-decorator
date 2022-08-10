import { Route } from '../common'
import { createMethodDecorator } from '../builder'

export function ApiOperation(operation: Partial<Route>) {
  return createMethodDecorator(null, operation)
}
