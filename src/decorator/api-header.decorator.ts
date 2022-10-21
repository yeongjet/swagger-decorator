import _ from 'lodash'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'
import { enumToArray } from '../util'
import { Enum, Type } from '../storage'
import { ExampleObject, ReferenceObject, MediaTypeObject } from '../common/open-api/openapi-spec-v3.1.0'

export interface ApiHeaderOption {
    type?: Type
    format?: string
    enum?: Enum
    name: string
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    explode?: boolean
    allowReserved?: boolean
    examples?: Record<string, ExampleObject | ReferenceObject>
    example?: any
    content?: Record<string, MediaTypeObject>
}

const defaultOption: Partial<ApiHeaderOption> = {
    required: true
}

export function ApiHeader(option: ApiHeaderOption) {
    const { type, format, enum: enums, ...processless } = { ...defaultOption, ...option }
    let schema = {}
    if (type) {
        schema = { type, format }
    } else if (enums) {
        const { itemType, items } = enumToArray(enums)
        schema = { enum: items, type: itemType }
    }
    // return createClassMethodDecorator({ headers: [ { ...processless, schema } ] })
    return (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
        guard(_.isString(property), `property key must be string`)
        if (property) {
            set(storage, `controllers.${(target as Object).constructor.name}.${property as string}.consumes`, mimeTypes)
        } else {
            set(storage, `controllers.${(target as Function).name}.${property}.consumes`, mimeTypes)
        }
    }
}
