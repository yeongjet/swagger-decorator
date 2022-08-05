import _ from 'lodash'
import { ApiPropertyOptions } from './decorator/index.js'
import { BaseParameter, Reference, Schema } from './open-api/open-api-spec.interface.js'
import { ParamWithTypeMetadata } from './open-api/index.js'

export class SwaggerTypesMapper {
  private readonly keysToRemove: Array<keyof ApiPropertyOptions | '$ref'> = [ 'type', 'isArray', 'enum', 'enumName', 'items', '$ref', ...this.getSchemaOptionsKeys() ]

  mapParamTypes(
    parameters: Array<ParamWithTypeMetadata | BaseParameter>
  ) {
    return parameters.map(param => {
      if (this.hasSchemaDefinition(param as BaseParameter)) {
        return this.omitParamKeys(param)
      }
      const { type } = param as ParamWithTypeMetadata
      const typeName = type && _.isFunction(type) ? this.mapTypeToOpenAPIType(type.name) : this.mapTypeToOpenAPIType(type as any)

      const paramWithTypeMetadata = _.omitBy({ ...param, type: typeName }, _.isUndefined)

      if (this.isEnumArrayType(paramWithTypeMetadata)) {
        return this.mapEnumArrayType(paramWithTypeMetadata as ParamWithTypeMetadata, this.keysToRemove)
      } else if (paramWithTypeMetadata.isArray) {
        return this.mapArrayType(paramWithTypeMetadata as ParamWithTypeMetadata, this.keysToRemove)
      }
      return {
        ..._.omit(param, this.keysToRemove),
        schema: _.omitBy({
          ...this.getSchemaOptions(param), ...((param as BaseParameter).schema || {}),
          enum: paramWithTypeMetadata.enum,
          type: paramWithTypeMetadata.type,
          $ref: (paramWithTypeMetadata as Reference).$ref
        }, _.isUndefined)
      }
    })
  }

  mapTypeToOpenAPIType(type: string | Function): string {
    if (!(type && (type as string).charAt)) {
      return ''
    }
    return (type as string).charAt(0).toLowerCase() + (type as string).slice(1)
  }

  mapEnumArrayType(
    param: Record<string, any>,
    keysToRemove: Array<keyof ApiPropertyOptions | '$ref'>
  ) {
    return {
      ..._.omit(param, keysToRemove),
      schema: { ...this.getSchemaOptions(param), type: 'array', items: param.items }
    }
  }

  mapArrayType(
    param: (ParamWithTypeMetadata & Schema) | BaseParameter,
    keysToRemove: Array<keyof ApiPropertyOptions | '$ref'>
  ) {
    const items =
      (param as Schema).items ||
      _.omitBy(
        {
          ...((param as BaseParameter).schema || {}),
          enum: (param as ParamWithTypeMetadata).enum,
          type: this.mapTypeToOpenAPIType((param as any).type)
        },
        _.isUndefined
      )
    return {
      ..._.omit(param, keysToRemove),
      schema: {
        ...this.getSchemaOptions(param),
        type: 'array',
        items
      }
    }
  }

  private getSchemaOptions(param: Record<string, any>): Partial<Schema> {
    const schemaKeys = this.getSchemaOptionsKeys()
    const optionsObject: Partial<Schema> = schemaKeys.reduce((acc, key) => ({
        ...acc,
        [key]: param[key]
      }), {})
    return _.omitBy(optionsObject, _.isUndefined)
  }

  private isEnumArrayType(param: Record<string, any>): boolean {
    return param.isArray && param.items && param.items.enum
  }

  private hasSchemaDefinition(param: BaseParameter): param is BaseParameter {
    return !!param.schema
  }

  private omitParamKeys(param: ParamWithTypeMetadata | BaseParameter) {
    return _.omit(param, this.keysToRemove)
  }

  private getSchemaOptionsKeys(): Array<keyof Schema> {
    return [
      'patternProperties',
      'additionalProperties',
      'minimum',
      'maximum',
      'maxProperties',
      'minItems',
      'minProperties',
      'maxItems',
      'minLength',
      'maxLength',
      'exclusiveMaximum',
      'exclusiveMinimum',
      'uniqueItems',
      'title',
      'format',
      'pattern',
      'nullable',
      'default'
    ]
  }
}
