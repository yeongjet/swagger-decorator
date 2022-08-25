import { Storage } from '../common'
import { createMethodDecorator } from '../builder'

export function ApiOperation(operation: Partial<Storage.Controller.Route>) {
  // TODO
  // @ts-ignore
  return createMethodDecorator(null, operation)
}
