import _ from 'lodash'
import { Type, Enum, PropertyKey, ParamWithTypeMetadata, EnumArray, SchemaMetadata } from './common/open-api/index.js'
import { Schema } from './common/open-api/open-api-spec.interface.js'
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

export const isContain = (first: object, second: object) => {
    for (const key of Object.keys(second)) {
        if (first[key] !== second[key]) {
            return false
        }
    }
    return true
}

export const isValidKey = (name?: string) => _.isString(name) && name.length > 0

export const negate = (value: boolean) => !value

export const guard = (condition: boolean, message: string) => {
    if (!condition) {
        throw new Error(message)
    }
}

export const set = (target: any, keys: (string | Record<string, any>)[], values: any[]) => {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        let parent: any
        let parentKey
        guard(_.isString(key) || _.isObject(key), `the key:${key}(${typeof key}) of ${target}(${typeof target}) is invalid`)
        if (_.isString(key)) {
            parentKey = key
            if (_.isUndefined(target[key]) && values[i]) {
                target[key] = values[i]
            }
            parent = target
            target = target[key]
        } else if (_.isObject(key)) {
            const subKey = Object.keys(key)[0]
            guard(
                _.isString(subKey) && _.isObject(key[subKey]),
                `the key:${JSON.stringify(key)} of ${target}(${typeof target}) is invalid`
            )
            target = target[subKey]
            guard(_.isArray(target), `the target:${target} must be array`)
            let item = target.find(n => isContain(n, key[subKey]))
            if (_.isUndefined(item) && values[i]) {
                item = values[i]
                target.push(item)
            }
            parent = target
            target = item
        }
        guard(negate(_.isUndefined(target)), 'target is not found')
        if (i === keys.length - 1) {
            if (_.isArray(target)) {
                target.push(values[i])
            } else if (_.isObject(target)) {
                Object.assign(target, values[i + 1])
            } else if(isValidKey(parentKey)) {
                parent[parentKey] = values[i]
            }
        }
    }
}