import _ from 'lodash'
import { API_EXCLUDE_CONTROLLER_METADATA, API_TAG_METADATA, API_SECURITY_METADATA, API_EXTRA_MODELS_METADATA, API_RESPONSE_METADATA, API_PRODUCES_METADATA } from './constant/index.js'
import { ApiResponseMetadata } from './index.js'
import { Type } from './type/index.js'
import { Schema } from './type/open-api-spec.interface.js'
import { ResponseObjectFactory } from './response-object-factory.js'

const responseObjectFactory = new ResponseObjectFactory()

export const getApiExcludeControllerMetadata = controller => {
    return Reflect.getMetadata(API_EXCLUDE_CONTROLLER_METADATA, controller)?.[0] || false
}

export const getGlobalApiTagsMetadata = controller => {
    return Reflect.getMetadata(API_TAG_METADATA, controller)
}

export const getGlobalApiSecurityMetadata = controller => {
    return Reflect.getMetadata(API_SECURITY_METADATA, controller)
}

export const getGlobalApiResponseMetadata = (controller: Type<unknown>, schemas: Record<string, Schema>) => {
    const responses: ApiResponseMetadata[] = Reflect.getMetadata(API_RESPONSE_METADATA, controller)
    const produces = Reflect.getMetadata(API_PRODUCES_METADATA, controller) || [ 'application/json' ]
    const openApiResponses = _.mapValues(responses, (response: ApiResponseMetadata) =>
          responseObjectFactory.create(response, produces, schemas)
    )
    return _.mapValues(openApiResponses, (n: any) => _.omit(n, 'type'))
}

export const getGlobalApiExtraModelsMetadata = (metatype: Type<unknown>): Function[] => {
    return Reflect.getMetadata(API_EXTRA_MODELS_METADATA, metatype) || []
}

export class Scanner {
    private readonly schemas: Record<string, Schema> = {}
    scan(controllers){
        controllers.map(controller => {
            const isExcludeController = getApiExcludeControllerMetadata(controller)
            const tags = getGlobalApiTagsMetadata(controller)
            const security = getGlobalApiSecurityMetadata(controller)
            const responses = getGlobalApiResponseMetadata(controller, this.schemas)
            console.log(isExcludeController)
            if (isExcludeController) {
                return []
            }
        })

    }
}