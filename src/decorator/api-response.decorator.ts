import _ from 'lodash'
import { StatusCodes as HttpStatus } from 'http-status-codes'
import { API_RESPONSE_METADATA } from '../constant/index.js'
import { Response, Schema, Reference } from '../common/open-api/open-api-spec.interface.js'
import { Type } from '../common/open-api/index.js'

export interface ApiResponseMetadata extends Omit<Response, 'description'> {
    status?: number
    type?: Type<unknown> | Function | string
    isArray?: boolean
    description?: string
}

export interface ApiResponseSchemaHost extends Omit<Response, 'description'> {
    schema: Schema & Partial<Reference>
    status?: number
    description?: string
}

export type ApiResponseOptions = ApiResponseMetadata | ApiResponseSchemaHost

const defaultApiResponseOption = {
    status: HttpStatus.OK,
    isArray: false,
    description: ''
}

export function ApiResponse(option: ApiResponseMetadata): MethodDecorator & ClassDecorator
export function ApiResponse(option: ApiResponseSchemaHost): MethodDecorator & ClassDecorator
export function ApiResponse(option: ApiResponseMetadata | ApiResponseSchemaHost): MethodDecorator & ClassDecorator {
    const tmpOption = _.defaults(option, defaultApiResponseOption)
    const groupedMetadata = { [tmpOption.status]: _.omit(option, 'status') }
    return (target: object, key?: Property, descriptor?: TypedPropertyDescriptor<any>): any => {
        if (descriptor) {
            const responses = Reflect.getMetadata(API_RESPONSE_METADATA, descriptor.value) || {}
            Reflect.defineMetadata(API_RESPONSE_METADATA, { ...responses, ...groupedMetadata }, descriptor.value)
            return descriptor
        }
        const responses = Reflect.getMetadata(API_RESPONSE_METADATA, target) || {}
        Reflect.defineMetadata(API_RESPONSE_METADATA, { ...responses, ...groupedMetadata }, target)
        return target
    }
}

export const ApiOkResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.OK })

export const ApiCreatedResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.CREATED })

export const ApiAcceptedResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.ACCEPTED})

export const ApiNoContentResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.NO_CONTENT })

export const ApiMovedPermanentlyResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.MOVED_PERMANENTLY })

export const ApiMovedTemporarilyResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.MOVED_TEMPORARILY })

export const ApiBadRequestResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.BAD_REQUEST })

export const ApiUnauthorizedResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.UNAUTHORIZED })

export const ApiTooManyRequestsResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.TOO_MANY_REQUESTS })

export const ApiNotFoundResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.NOT_FOUND })

export const ApiInternalServerErrorResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.INTERNAL_SERVER_ERROR })

export const ApiBadGatewayResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.BAD_GATEWAY })

export const ApiConflictResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.CONFLICT })

export const ApiForbiddenResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.FORBIDDEN })

export const ApiGatewayTimeoutResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.GATEWAY_TIMEOUT })

export const ApiGoneResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.GONE })

export const ApiMethodNotAllowedResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.METHOD_NOT_ALLOWED })

export const ApiNotAcceptableResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.NOT_ACCEPTABLE })

export const ApiNotImplementedResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.NOT_IMPLEMENTED })

export const ApiPreconditionFailedResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.PRECONDITION_FAILED })

export const ApiRequestTooLongResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.REQUEST_TOO_LONG })

export const ApiRequestTimeoutResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.REQUEST_TIMEOUT })

export const ApiServiceUnavailableResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.SERVICE_UNAVAILABLE })

export const ApiUnprocessableEntityResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.UNPROCESSABLE_ENTITY })

export const ApiUnsupportedMediaTypeResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.UNSUPPORTED_MEDIA_TYPE })

export const ApiDefaultResponse = (options: ApiResponseOptions = {}) => ApiResponse({ ...options, status: HttpStatus.OK })
