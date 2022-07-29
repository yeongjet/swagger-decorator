import _ from 'lodash'
import { Type } from './common/open-api/index.js'
import { flatten, isFunction, isString, keyBy, mapValues, omit, omitBy, pick } from 'lodash'
import { API_MODEL_PROPERTIES_METADATA } from './constant/index.js'
import { getGlobalApiExtraModelsMetadata } from './scanner.js'
import { BaseParameter, Parameter, Reference, Schema } from './common/open-api/open-api-spec.interface.js'
import { SchemaMetadata, ParamWithTypeMetadata } from './common/open-api/index.js'
import { isBuiltInType, isDateCtor, isBodyParameter, getEnumType, getEnumValues, getTypeIsArrayTuple, isEnumArray, isEnumMetadata, getSchemaPath } from './util.js'
import { ModelPropertiesAccessor } from './model-properties-accessor.js'
import { SwaggerTypesMapper } from './swagger-types-mapper.js'

export class SchemaFactory {
    constructor(
        private readonly modelPropertiesAccessor: ModelPropertiesAccessor,
        private readonly swaggerTypesMapper: SwaggerTypesMapper
    ) {}

    createFromModel(parameters: ParamWithTypeMetadata[], schemas: Record<string, Schema>): Array<ParamWithTypeMetadata | BaseParameter> {
        const Parameters = parameters.map(param => {
            if (this.isLazyTypeFunc(param.type)) {
                [ param.type, param.isArray ] = getTypeIsArrayTuple((param.type as Function)(), false) as [Type<any>,boolean]
            }
            if (this.isPrimitiveType(param.type)) {
                return param
            }
            if (this.isArrayCtor(param.type)) {
                return this.mapArrayCtorParam(param)
            }
            if (!isBodyParameter(param)) {
                return this.createQueryOrParamSchema(param, schemas)
            }

            const modelName = this.exploreModelSchema(param.type as any, schemas)
            const name = param.name || modelName
            const schema = {
                ...((param as BaseParameter).schema || {}),
                $ref: getSchemaPath(modelName)
            }
            const isArray = param.isArray
            param = omit(param, 'isArray')

            if (isArray) {
                return { ...param, name, schema: { type: 'array', items: schema } }
            }
            return { ...param, name, schema }
        })
        return flatten(Parameters)
    }

    createQueryOrParamSchema(param: ParamWithTypeMetadata, schemas: Record<string, Schema>) {
        if (param.enumName) {
            return this.createEnumParam(param, schemas)
        }

        if (isDateCtor(param.type as Function)) {
            return {
                format: 'date-time',
                ...param,
                type: 'string'
            }
        }
        if (isFunction(param.type)) {
            const propertiesWithType = this.extractPropertiesFromType(param.type, schemas)
            if (!propertiesWithType) {
                return param
            }
            return propertiesWithType.map(property => {
                const Parameter = {
                    ...(omit(property, 'enumName') as Parameter),
                    in: 'query',
                    required: property.required ?? true
                }
                return Parameter
            }) as Parameter[]
        }
        return param
    }

    extractPropertiesFromType(type: Type<unknown>, schemas: Record<string, Schema>, pendingSchemasRefs: string[] = []) {
        const { prototype } = type
        if (!prototype) {
            return
        }
        const extraModels = getGlobalApiExtraModelsMetadata(type as Type<unknown>)
        extraModels.forEach(item => this.exploreModelSchema(item, schemas, pendingSchemasRefs))

        this.modelPropertiesAccessor.applyMetadataFactory(prototype)
        const modelProperties = this.modelPropertiesAccessor.getModelProperties(prototype)
        const propertiesWithType = modelProperties.map(key => {
            const property = this.mergePropertyWithMetadata(key, prototype, schemas, pendingSchemasRefs)
            const schemaCombinators = [ 'oneOf', 'anyOf', 'allOf' ]
            if (schemaCombinators.some(key => key in property)) {
                delete (property as SchemaMetadata).type
            }
            return property as Parameter
        })
        return propertiesWithType
    }

    exploreModelSchema(
        type: Type<unknown> | Function,
        schemas: Record<string, Schema>,
        pendingSchemasRefs: string[] = []
    ): string {
        if (this.isLazyTypeFunc(type as Function)) {
            type = (type as Function)()
        }
        const propertiesWithType = this.extractPropertiesFromType(type as Type<unknown>, schemas, pendingSchemasRefs)
        if (!propertiesWithType) {
            return ''
        }
        const typeDefinition: Schema = {
            type: 'object',
            properties: mapValues(keyBy(propertiesWithType, 'name'), property =>
                omit(property, [ 'name', 'isArray', 'required', 'enumName' ])
            ) as Record<string, Schema | Reference>
        }
        const typeDefinitionRequiredFields = propertiesWithType
            .filter(property => property.required != false)
            .map(property => property.name)

        if (typeDefinitionRequiredFields.length > 0) {
            typeDefinition['required'] = typeDefinitionRequiredFields
        }
        schemas[type.name] = typeDefinition
        return type.name
    }

    mergePropertyWithMetadata(
        key: string,
        prototype: Type<unknown>,
        schemas: Record<string, Schema>,
        pendingSchemaRefs: string[],
        metadata?: SchemaMetadata
    ): SchemaMetadata | Reference | Parameter {
        if (!metadata) {
            metadata = Reflect.getMetadata(API_MODEL_PROPERTIES_METADATA, prototype, key) || {}
        }
        if (this.isLazyTypeFunc(metadata!.type as Function)) {
            metadata!.type = (metadata!.type as Function)();
            [ metadata!.type, metadata!.isArray ] = getTypeIsArrayTuple(metadata!.type as Function, metadata!.isArray!)
        }

        if (Array.isArray(metadata!.type)) {
            return this.createFromNestedArray(key, metadata!, schemas, pendingSchemaRefs)
        }

        return this.createSchemaMetadata(key, metadata!, schemas, pendingSchemaRefs)
    }

    createEnumParam(param: ParamWithTypeMetadata & BaseParameter, schemas: Record<string, Schema>) {
        if (!param.enumName) {
            return
        }
        const enumName = param.enumName
        const $ref = getSchemaPath(enumName)

        if (!(enumName in schemas)) {
            const _enum = param.enum ? param.enum
                : param!.schema!['items']? param!.schema!['items']['enum'] : param!.schema!['enum']

            schemas[enumName] = {
                type: 'string',
                enum: _enum
            }
        }

        param.schema = param.isArray || param.schema?.['items'] ? { type: 'array', items: { $ref } } : { $ref }

        return omit(param, [ 'isArray', 'items', 'enumName', 'enum' ])
    }

    createEnumSchemaType(key: string, metadata: SchemaMetadata, schemas: Record<string, Schema>) {
        if (!metadata.enumName) {
            return {
                ...metadata,
                name: metadata.name || key
            }
        }
        const enumName = metadata.enumName
        const $ref = getSchemaPath(enumName)

        if (!(enumName in schemas)) {
            schemas[enumName] = {
                type: 'string',
                enum: metadata.isArray && metadata.items ? metadata.items['enum'] : metadata.enum
            }
        }

        const _schemaObject = {
            ...metadata,
            name: metadata.name || key,
            type: metadata.isArray ? 'array' : 'string'
        }

        const refHost = metadata.isArray ? { items: { $ref } } : { $ref }
        const paramObject = { ..._schemaObject, ...refHost }
        const pathsToOmit = [ 'enum', 'enumName' ]

        if (!metadata.isArray) {
            pathsToOmit.push('type')
        }

        return omit(paramObject, pathsToOmit)
    }

    createNotBuiltInTypeReference(
        key: string,
        metadata: SchemaMetadata,
        trueMetadataType: unknown,
        schemas: Record<string, Schema>,
        pendingSchemaRefs: string[]
    ): SchemaMetadata {
        if (_.isUndefined(trueMetadataType)) {
            throw new Error(
                `A circular dependency has been detected (property key: "${key}"). Please, make sure that each side of a bidirectional relationships are using lazy resolvers ("type: () => ClassType").`
            )
        }
        let schemaObjectName = (trueMetadataType as Function).name

        if (!(schemaObjectName in schemas) && !pendingSchemaRefs.includes(schemaObjectName)) {
            schemaObjectName = this.exploreModelSchema(trueMetadataType as Function, schemas, [
                ...pendingSchemaRefs,
                schemaObjectName
            ])
        }
        const $ref = getSchemaPath(schemaObjectName)
        if (metadata.isArray) {
            return this.transformToArraySchemaProperty(metadata, key, { $ref })
        }
        const keysToRemove = [ 'type', 'isArray', 'required' ]
        const validMetadataObject = omit(metadata, keysToRemove)
        const extraMetadataKeys = Object.keys(validMetadataObject)

        if (extraMetadataKeys.length > 0) {
            return {
                name: metadata.name || key,
                required: metadata.required,
                ...validMetadataObject,
                allOf: [ { $ref } ]
            } as SchemaMetadata
        }
        return {
            name: metadata.name || key,
            required: metadata.required,
            $ref
        } as SchemaMetadata
    }

    transformToArraySchemaProperty(metadata: SchemaMetadata, key: string, type: string | Record<string, any>): SchemaMetadata {
        const keysToRemove = [ 'type', 'enum' ]
        const [ movedProperties, keysToMove ] = this.extractPropertyModifiers(metadata)
        const schemaHost = {
            ...omit(metadata, [ ...keysToRemove, ...keysToMove ]),
            name: metadata.name || key,
            type: 'array',
            items: isString(type) ? { type, ...movedProperties } : { ...type, ...movedProperties }
        }
        schemaHost.items = omitBy(schemaHost.items, _.isUndefined)
        return schemaHost as any
    }

    mapArrayCtorParam(param: ParamWithTypeMetadata): any {
        return { ...omit(param, 'type'), schema: { type: 'array', items: { type: 'string' } } }
    }

    createFromObjectLiteral(key: string, literalObj: Record<string, any>, schemas: Record<string, Schema>) {
        const objLiteralKeys = Object.keys(literalObj)
        const properties = {}
        objLiteralKeys.forEach(key => {
            const propertyCompilerMetadata = literalObj[key]
            if (isEnumArray(propertyCompilerMetadata)) {
                propertyCompilerMetadata.type = 'array'

                const enumValues = getEnumValues(propertyCompilerMetadata.enum)
                propertyCompilerMetadata.items = {
                    type: getEnumType(enumValues),
                    enum: enumValues
                }
                delete propertyCompilerMetadata.enum
            } else if (propertyCompilerMetadata.enum) {
                const enumValues = getEnumValues(propertyCompilerMetadata.enum)

                propertyCompilerMetadata.enum = enumValues
                propertyCompilerMetadata.type = getEnumType(enumValues)
            }
            const propertyMetadata = this.mergePropertyWithMetadata(key, Object, schemas, [], propertyCompilerMetadata)
            const keysToRemove = [ 'isArray', 'name' ]
            const validMetadataObject = omit(propertyMetadata, keysToRemove)
            properties[key] = validMetadataObject
        })
        return { name: key, type: 'object', properties }
    }

    createFromNestedArray(key: string, metadata: SchemaMetadata, schemas: Record<string, Schema>, pendingSchemaRefs: string[]) {
        const recurse = (type: unknown) => {
            if (!Array.isArray(type)) {
                const schemaMetadata = this.createSchemaMetadata(key, metadata, schemas, pendingSchemaRefs, type)
                return omit(schemaMetadata, [ 'isArray', 'name' ])
            }
            return { name: key, type: 'array', items: recurse(type[0])}
        }
        return recurse(metadata.type)
    }

    private createSchemaMetadata(key: string, metadata: SchemaMetadata, schemas: Record<string, Schema>, pendingSchemaRefs: string[], nestedArrayType?: unknown) {
        const trueType = nestedArrayType || metadata.type
        if (this.isObjectLiteral(trueType as Record<string, any>)) {
            return this.createFromObjectLiteral(key, trueType as Record<string, any>, schemas)
        }
        if (isString(trueType)) {
            if (isEnumMetadata(metadata)) {
                return this.createEnumSchemaType(key, metadata, schemas)
            }
            if (metadata.isArray) {
                return this.transformToArraySchemaProperty(metadata, key, trueType)
            }

            return {
                ...metadata,
                name: metadata.name || key
            }
        }
        if (isDateCtor(trueType as Function)) {
            if (metadata.isArray) {
                return this.transformToArraySchemaProperty(metadata, key, {
                    format: metadata.format || 'date-time',
                    type: 'string'
                })
            }
            return {
                format: 'date-time',
                ...metadata,
                type: 'string',
                name: metadata.name || key
            }
        }
        if (this.isBigInt(trueType as Function)) {
            return {
                format: 'int64',
                ...metadata,
                type: 'integer',
                name: metadata.name || key
            }
        }
        if (!isBuiltInType(trueType as Function)) {
            return this.createNotBuiltInTypeReference(key, metadata, trueType, schemas, pendingSchemaRefs)
        }
        const typeName = this.getTypeName(trueType as Type<unknown>)
        const itemType = this.swaggerTypesMapper.mapTypeToOpenAPIType(typeName)
        if (metadata.isArray) {
            return this.transformToArraySchemaProperty(metadata, key, {
                type: itemType
            })
        } else if (itemType === 'array') {
            const defaultOnArray = 'string'
            return this.transformToArraySchemaProperty(metadata, key, {
                type: defaultOnArray
            })
        }
        return {
            ...metadata,
            name: metadata.name || key,
            type: itemType
        }
    }

    private isArrayCtor(type?: Type<unknown> | string): boolean {
        return type === Array
    }

    private isPrimitiveType(type?: Type<unknown> | string): boolean {
        return isFunction(type) && [ String, Boolean, Number ].some(item => item === type)
    }

    private isLazyTypeFunc(type?: Function | Type<unknown> | string): type is { type: Function } & Function {
        return isFunction(type) && type.name == 'type'
    }

    private getTypeName(type: Type<unknown> | string): string {
        return type && isFunction(type) ? type.name : (type as string)
    }

    private isObjectLiteral(obj: Record<string, any> | undefined) {
        if (typeof obj !== 'object' || !obj) {
            return false
        }
        const hasOwnProp = Object.prototype.hasOwnProperty
        let objPrototype = obj
        while (Object.getPrototypeOf((objPrototype = Object.getPrototypeOf(objPrototype))) !== null);

        for (const prop in obj) {
            if (!hasOwnProp.call(obj, prop) && !hasOwnProp.call(objPrototype, prop)) {
                return false
            }
        }
        return Object.getPrototypeOf(obj) === objPrototype
    }

    private isBigInt(type: Function | Type<unknown> | string): boolean {
        return type === BigInt
    }

    private extractPropertyModifiers(metadata: SchemaMetadata): [Partial<SchemaMetadata>, string[]] {
        const modifierKeys = [ 'format', 'maximum', 'maxLength', 'minimum', 'minLength', 'pattern' ]
        return [ pick(metadata, modifierKeys), modifierKeys ]
    }
}
