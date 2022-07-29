import _ from 'lodash'
import { API_OPERATION_METADATA } from '../constant/index.js'
import { Operation } from '../open-api/open-api-spec.interface.js'
import { createMethodDecorator } from 'decorator-generator'

const defaultOption = { summary: '' }

export function ApiOperation(option: Partial<Operation>) {
  return createMethodDecorator(API_OPERATION_METADATA, _.defaults(option, defaultOption))
}
