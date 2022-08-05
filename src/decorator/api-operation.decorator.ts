import { Route } from '../common'
import { createApiOperationDecorator } from '../builder'

export function ApiOperation(operation: Partial<Route>) {
  return createApiOperationDecorator(operation)
}
