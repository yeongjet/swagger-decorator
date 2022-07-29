import _ from 'lodash'
import { Type, Enum, PropertyKey, ParamWithTypeMetadata, EnumArray, SchemaMetadata } from '../open-api/index.js'
import { Schema } from '../open-api/open-api-spec.interface.js'
import { METADATA_FACTORY_NAME, API_MODEL_PROPERTIES_ARRAY_METADATA } from '../constant/index.js'

export function createPropertyDecorator<T extends Record<string, any> = any>(metakey: string, metadata: T): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        if (_.isSymbol(propertyKey)) {
            return
        }
        const properties = Reflect.getMetadata(API_MODEL_PROPERTIES_ARRAY_METADATA, target) || []
        const key = `:${propertyKey}`
        if (!properties.includes(key)) {
            Reflect.defineMetadata(API_MODEL_PROPERTIES_ARRAY_METADATA, [ ...properties, `:${propertyKey}` ], target)
        }
        const existingMetadata = Reflect.getMetadata(metakey, target, propertyKey)
        if (existingMetadata) {
            const newMetadata = _.omitBy(metadata, _.isUndefined)
            const metadataToSave = { ...existingMetadata, ...newMetadata }
            Reflect.defineMetadata(metakey, metadataToSave, target, propertyKey)
        } else {
            const type =
                target?.constructor?.[METADATA_FACTORY_NAME]?.()[propertyKey]?.type ??
                Reflect.getMetadata('design:type', target, propertyKey)
            Reflect.defineMetadata(metakey, { type, ..._.omitBy(metadata, _.isUndefined) }, target, propertyKey)
        }
    }
}

export function getEnumType(enums: EnumArray) {
    return _.some(enums, _.isString) ? 'string' : 'number'
}

export function getEnumArray(enums: Enum): EnumArray {
    if (_.isArray(enums)) {
        return _.uniq(_.reject(enums, _.isNil)) as EnumArray
    }
    return _.uniq(_.keys(enums).filter(_.isNaN))
}

export function getTypeIsArrayTuple(input: Function | [Function] | undefined | string | Record<string, any>, isArrayFlag: boolean): [Function | undefined, boolean] {
    if (!input) {
        return [ input as undefined, isArrayFlag ]
    }
    if (isArrayFlag) {
        return [ input as Function, isArrayFlag ]
    }
    const isInputArray = _.isArray(input)
    const type = isInputArray ? input[0] : input
    return [ type as Function, isInputArray ]
}

export function addEnumArraySchema(paramDefinition: Partial<Record<'schema' | 'isArray' | 'enumName', any>>, decoratorOptions: Partial<Record<'enum' | 'enumName', any>>) {
    const paramSchema: Schema = paramDefinition.schema || {}
    paramDefinition.schema = paramSchema
    paramSchema.type = 'array'
    delete paramDefinition.isArray

    const enumValues = getEnumValues(decoratorOptions.enum)
    paramSchema.items = {
        type: getEnumType(enumValues),
        enum: enumValues
    }

    if (decoratorOptions.enumName) {
        paramDefinition.enumName = decoratorOptions.enumName
    }
}

export function addEnumSchema(
    paramDefinition: Partial<Record<string, any>>,
    decoratorOptions: Partial<Record<string, any>>
) {
    const paramSchema: Schema = paramDefinition.schema || {}
    const enumValues = getEnumValues(decoratorOptions.enum)

    paramDefinition.schema = paramSchema
    paramSchema.enum = enumValues
    paramSchema.type = getEnumType(enumValues)

    if (decoratorOptions.enumName) {
        paramDefinition.enumName = decoratorOptions.enumName
    }
}

const BUILT_IN_TYPES = [ String, Boolean, Number, Object, Array ]

export function getSchemaPath(model: string | Function): string {
    const modelName = _.isString(model) ? model : model && model.name
    return `#/components/schemas/${modelName}`
}

// export const isEnumArray = (obj: any): boolean => !!obj.isArray && !!obj.enum

export const isEnumDefined = (obj: any) => !!obj.enum

export const isEnumMetadata = (metadata: SchemaMetadata) =>
    metadata.enum || (metadata.isArray && metadata.items?.['enum'])

export const isDateCtor = (type: Type<unknown> | Function | string): boolean => type === Date

export const isBuiltInType = (type: Type<unknown> | Function | string): boolean =>
    _.isFunction(type) && BUILT_IN_TYPES.some(item => item === type)

export const isBodyParameter = (param: ParamWithTypeMetadata): boolean => param.in === 'body'
