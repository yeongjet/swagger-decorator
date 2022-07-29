// @ts-nocheck
import { API_SECURITY_METADATA } from '../constant/index.js'
import { createClassAndMethodDecorator, appendMetaArray } from '@infra/decorator-util/index.js'

export function ApiSecurity(name: string, requirements: string[] = []) {
    return createClassAndMethodDecorator(API_SECURITY_METADATA, { [name]: requirements }, appendMetaArray)
}
