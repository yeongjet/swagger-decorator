import { Storage } from '../common'
import { createMethodDecorator } from '../builder'

export function ApiOperation(operation: Partial<Storage.Controller.Route>) {
  return createMethodDecorator(null, operation)
}
