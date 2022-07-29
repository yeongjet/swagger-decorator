import { API_EXCLUDE_CONTROLLER_METADATA } from '../constant/index.js'
import { createClassDecorator } from 'decorator-generator'

export function ApiExcludeController() {
    return createClassDecorator(API_EXCLUDE_CONTROLLER_METADATA, true)
}
