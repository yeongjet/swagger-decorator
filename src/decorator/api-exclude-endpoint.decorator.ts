import { API_EXCLUDE_ENDPOINT_METADATA } from '../constant/index.js'
import { createMethodDecorator } from 'decorator-generator'

export function ApiExcludeEndpoint() {
    return createMethodDecorator(API_EXCLUDE_ENDPOINT_METADATA, true)
}
