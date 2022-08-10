import _ from 'lodash'
import { ApiResponseMetadata, ApiResponseSchemaHost } from './decorator/index.js'
import { Schema } from './common/open-api/open-api.js'

import { SchemaFactory } from './schema-object-factory.js'
import { SwaggerTypesMapper } from './swagger-types-mapper.js'
import { MimetypeContentWrapper } from './mimetype-content-wrapper.js'
import { ModelPropertiesAccessor } from './model-properties-accessor.js'
import { ResponseObjectMapper } from './response-object-mapper.js'

export class ResponseObjectFactory {
    private readonly mimetypeContentWrapper = new MimetypeContentWrapper()
    private readonly modelPropertiesAccessor = new ModelPropertiesAccessor()
    private readonly swaggerTypesMapper = new SwaggerTypesMapper()
    private readonly SchemaFactory = new SchemaFactory(this.modelPropertiesAccessor, this.swaggerTypesMapper)
    private readonly responseObjectMapper = new ResponseObjectMapper()

    create(response: ApiResponseMetadata, produces: string[], schemas: Record<string, Schema>) {
        const { type, isArray } = response as ApiResponseMetadata
        response = _.omit(response, [ 'isArray' ])
        if (!type) {
            return this.responseObjectMapper.wrapSchemaWithContent(response as ApiResponseSchemaHost, produces)
        }
        if (isBuiltInType(type as Function)) {
            const typeName = type && _.isFunction(type) ? (type as Function).name : (type as string)
            const swaggerType = this.swaggerTypesMapper.mapTypeToOpenAPIType(typeName)
            if (isArray) {
                const content = this.mimetypeContentWrapper.wrap(produces, {
                    schema: {
                        type: 'array',
                        items: {
                            type: swaggerType
                        }
                    }
                })
                return {
                    ...response,
                    ...content
                }
            }
            const content = this.mimetypeContentWrapper.wrap(produces, {
                schema: {
                    type: swaggerType
                }
            })
            return {
                ...response,
                ...content
            }
        }
        const name = this.SchemaFactory.exploreModelSchema(type as Function, schemas)
        if (isArray) {
            return this.responseObjectMapper.toArrayRefObject(response, name, produces)
        }
        return this.responseObjectMapper.toRefObject(response, name, produces)
    }
}
