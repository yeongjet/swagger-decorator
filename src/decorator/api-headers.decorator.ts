import _ from 'lodash'
import { ApiHeader, ApiHeaderOption } from './api-header.decorator.js'
import { PropertyKey } from '../open-api/index.js'

export const ApiHeaders = (headers: ApiHeaderOption[]) => {
    return (target: Object, key?: PropertyKey, descriptor?: PropertyDescriptor): any => {
        // @ts-ignore
        headers.forEach(header => ApiHeader(header)(target, key, descriptor))
    }
}
