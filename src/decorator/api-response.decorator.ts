import _ from 'lodash'
import { StatusCodes } from 'http-status-codes'
import { guard, set } from '../util'
import { storage } from '../storage'
import { Type, ClassDecoratorParams, MethodDecoratorParams } from '../interface'
import { Links } from '../interface/open-api'

export interface ApiResponseOption {
    type?: Type
    status?: StatusCodes
    description?: string
    headers?: Headers
    links?: Links
}

const defaultOption = {
    status: StatusCodes.OK,
}

export function ApiResponse(receivedOption: ApiResponseOption): MethodDecorator & ClassDecorator {
    return (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
        guard(_.isString(property), `property key must be string`)
        const option = { ...defaultOption, ...receivedOption }
        const path = property ? `controllers.${(target as Object).constructor.name}.handlers.${property as string}.responses` : 
            `controllers.${(target as Function).name}.responses`
        set(storage, path, [ option ])
    }
}

export const ApiOkResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.OK })

export const ApiCreatedResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.CREATED })

export const ApiAcceptedResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.ACCEPTED})

export const ApiNoContentResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.NO_CONTENT })

export const ApiMovedPermanentlyResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.MOVED_PERMANENTLY })

export const ApiMovedTemporarilyResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.MOVED_TEMPORARILY })

export const ApiBadRequestResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.BAD_REQUEST })

export const ApiUnauthorizedResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.UNAUTHORIZED })

export const ApiTooManyRequestsResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.TOO_MANY_REQUESTS })

export const ApiNotFoundResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.NOT_FOUND })

export const ApiInternalServerErrorResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.INTERNAL_SERVER_ERROR })

export const ApiBadGatewayResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.BAD_GATEWAY })

export const ApiConflictResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.CONFLICT })

export const ApiForbiddenResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.FORBIDDEN })

export const ApiGatewayTimeoutResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.GATEWAY_TIMEOUT })

export const ApiGoneResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.GONE })

export const ApiMethodNotAllowedResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.METHOD_NOT_ALLOWED })

export const ApiNotAcceptableResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.NOT_ACCEPTABLE })

export const ApiNotImplementedResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.NOT_IMPLEMENTED })

export const ApiPreconditionFailedResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.PRECONDITION_FAILED })

export const ApiRequestTooLongResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.REQUEST_TOO_LONG })

export const ApiRequestTimeoutResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.REQUEST_TIMEOUT })

export const ApiServiceUnavailableResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.SERVICE_UNAVAILABLE })

export const ApiUnprocessableEntityResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.UNPROCESSABLE_ENTITY })

export const ApiUnsupportedMediaTypeResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.UNSUPPORTED_MEDIA_TYPE })

export const ApiDefaultResponse = (option?: ApiResponseOption) => ApiResponse({ ...option, status: StatusCodes.OK })
