import _ from 'lodash'
import fs from 'fs'
import { storage, Components, Parameter as StorageParameter } from './storage'
import { OpenAPI, ParameterObject, RequestBodyObject, SchemaObject } from './interface/open-api'
import { warning, wrapBrace, set, extractEnum, remove, extractType, guard } from './util'
import { Type, DecoratorParameterLocation, BindingParameterLocation, Some, Enum, Primitive } from './interface'
import { Class, SetRequired } from 'type-fest'
import { ApiPropertyOption } from './decorator'

type BindingParameter = { name?: string; in: `${BindingParameterLocation}`; type: Type }
type NotPrimitiveUnnamedBindingParameter = { in: `${DecoratorParameterLocation}`; type: Class<any> }
type NamedBindingParameter = { name: string; in: `${DecoratorParameterLocation}`; type: Type }
type UnnamedBindingParameter = { in: `${DecoratorParameterLocation}`; type: Type }
type TransformedBindingParameter = SetRequired<ApiPropertyOption, 'name'> & { in: `${DecoratorParameterLocation}` }

export const isPrimitive = <T extends { name?: string; type?: Some<Type>; enum?: Enum }>(
    parameter: T
): parameter is T & { name: string; type?: Some<Primitive> } => {
    guard(
        (_.isNil(parameter.type) && !_.isNil(parameter.enum)) || (!_.isNil(parameter.type) && _.isNil(parameter.enum)),
        'parameters in isPrimitive() is incorrect'
    )
    if (_.isNil(parameter.type) && !_.isNil(parameter.enum)) {
        return true
    } else if (!_.isNil(parameter.type) && _.isNil(parameter.enum)) {
        const type = extractType(parameter.type)!
        return _.isFunction(type) && [String, Number, Boolean, Date, BigInt].some(n => n === type)
    }
    return false
}

export type BuildDocumentOption = {
    title?: string
    version?: string
    routePrefixGetter?: (controllerName: string) => string
    routeBindingGetter: (
        controllerName: string,
        routeName: string
    ) => { httpMethod: string; url: string; parameters?: BindingParameter[] }
}

const generateSchemaObject = (parameter: StorageParameter | ApiPropertyOption): SchemaObject => {
    let schema: SchemaObject = _.omit(parameter, 'type', 'enum', 'required', 'examples')
    if (!_.isNil(parameter.type)) {
        const isArray = _.isArray(parameter.type)
        const type = extractType(parameter.type)
        if (_.isDate(type)) {
            schema.type = 'string'
            schema.format = 'date-time'
        } else if (type === BigInt) {
            schema.type = 'integer'
            schema.format = 'int64'
        } else {
            const typeName = (type as Function).name
            schema.type = typeName.charAt(0).toLowerCase() + typeName.slice(1)
        }
        if (isArray) {
            schema.items = { type: schema.type }
            schema.type = 'array'
        }
    } else if (!_.isNil(parameter.enum)) {
        const { itemType, items } = extractEnum(parameter.enum)
        schema.type = itemType
        schema.enum = items
    }
    return schema
}

const transformParameter = (parameter: StorageParameter, components: Components) => {
    const result: ParameterObject[] = []
    if (isPrimitive(parameter)) {
        result.push({ ..._.omit(parameter, 'type', 'enum'), schema: generateSchemaObject(parameter) })
    } else {
        const component = remove(components, extractType(parameter.type)!.name)
        guard(!_.isNil(component), 'component not found, please use @ApiProperty to annotate class property')
        for (const [propertyName, propertyValue] of Object.entries(component!)) {
            result.push({
                ..._.omit(parameter, 'type'),
                ..._.pick(propertyValue, 'required', 'examples'),
                name: propertyName,
                schema: generateSchemaObject(propertyValue)
            })
        }
    }
    return result
}

const generateParametersObject = (
    components: Components | undefined,
    bindingParameters: BindingParameter[],
    storageParameters: StorageParameter[]
) => {
    const [unnamedBindingParameters, namedBindingParameters] = _.partition(
        bindingParameters.filter(n => n.type !== Object && n.in !== BindingParameterLocation.BODY),
        n => _.isNil(n.name)
    ) as [UnnamedBindingParameter[], NamedBindingParameter[]]
    const transformedBindingParameters: TransformedBindingParameter[] = namedBindingParameters
    ;(_.filter(unnamedBindingParameters, n => !isPrimitive(n)) as NotPrimitiveUnnamedBindingParameter[]).map(n => {
        const type = extractType(n.type)!
        const component = remove(components, type.name)
        guard(!_.isNil(component), 'component not found, please use @ApiProperty to annotate class property')
        for (const [propertyName, propertyValue] of Object.entries(component!)) {
            if (!isPrimitive(propertyValue)) {
                warning(`properties(${propertyName}) in ${type.name} will be ignored`)
                continue
            }
            transformedBindingParameters.push({
                name: propertyValue.name ?? propertyName,
                in: n.in,
                ..._.omit(propertyValue, 'name')
            })
        }
    })
    const transformedStorageParameters = _.flatten(
        storageParameters.map(parameter => transformParameter(parameter, components || {}))
    )
    const result = _.flatten(
        transformedBindingParameters.map(bindingParam => {
            const [namedStorageParam] = _.remove(transformedStorageParameters, {
                name: bindingParam.name,
                in: bindingParam.in
            })
            if (namedStorageParam) {
                Object.assign(bindingParam, namedStorageParam)
            }
            return transformParameter(bindingParam, components || {})
        })
    ).concat(transformedStorageParameters)
    return result
}

const generateRequestBodyObject = (
    bindingParameters: BindingParameter[],
    storageBody: any,
    consumes: string[]
): RequestBodyObject | void => {
    const body =
        storageBody ??
        bindingParameters.find(n => n.type !== Object && !(!_.isNil(n.name) && n.in === BindingParameterLocation.BODY))
    if (_.isEmpty(body)) {
        return
    }
    const content = consumes.reduce(
        (acc, item) => ({
            ...acc,
            [item]: {
                schema: {
                    $ref: `#/components/schemas/${body.type.constructor.name}`
                }
            }
        }),
        {}
    )
    return { ..._.pick(body, 'description', 'required'), content }
}

const generateResponsesObject = (storageResponse: any, produces: string[]) => {
    return produces.reduce((pacc, pitem: any) => {
        const response = { ...pacc, [pitem.status]: _.pick(pitem, 'description', 'headers', 'links') }
        if (pitem.type) {
            const content = produces.reduce(
                (acc, item) => ({
                    ...acc,
                    [item]: {
                        ..._.pick(storageResponse, 'example', 'examples'),
                        schema: {
                            $ref: `#/components/schemas/${pitem?.type.constructor.name}`
                        }
                    }
                }),
                {}
            )
            Object.assign(response, content)
        }
        return response
    }, {})
}

const generateComponentsObject = (storageComponents: Components) => {
    const components = {}
    for (const [componentName, component] of Object.entries(storageComponents)) {
        for (const [propertyName, propertyValue] of Object.entries(component)) {
            set(components, `schema.${componentName}.properties.${propertyName}`, generateSchemaObject(propertyValue))
        }
        const required = _.reduce(
            component as any,
            (acc, value, key) => (value.required ? acc.concat(key) : acc),
            [] as string[]
        )
        set(components, `schema.${componentName}.required`, required)
    }
    return components
}

export const buildDocument = (option: BuildDocumentOption) => {
    const { routePrefixGetter, routeBindingGetter, title, version } = option
    const doc: OpenAPI = {
        openapi: '3.1.0',
        info: {
            title: title || '',
            version: version || ''
        }
    }
    let a = storage
    for (const [controllerName, controllerStorage] of Object.entries(storage.controllers || {})) {
        const routePrefix = routePrefixGetter ? routePrefixGetter(controllerName) : ''
        for (const [handlerName, handlerStorage] of Object.entries(controllerStorage.handlers) as any) {
            const consumes = handlerStorage.consumes || controllerStorage.consumes || ['application/json']
            const produces = handlerStorage.produces || controllerStorage.produces || ['application/json']
            const routeBinding = routeBindingGetter(controllerName, handlerName)
            const parameters = generateParametersObject(
                storage.components,
                routeBinding.parameters || [],
                handlerStorage.parameters || []
            )
            const requestBody = generateRequestBodyObject(routeBinding.parameters || [], handlerStorage.body, consumes)
            const responses = generateResponsesObject(handlerStorage.responses, produces)
            const httpMethod = routeBinding.httpMethod.toLowerCase()
            const routePath = routePrefix + wrapBrace(routeBinding.url)
            set(
                doc,
                `paths.${routePath}.${httpMethod}`,
                _.omitBy(
                    { parameters, requestBody, responses, ..._.pick(controllerStorage, 'tags', 'security') },
                    _.isEmpty
                )
            )
        }
    }
    set(doc, `components`, generateComponentsObject(storage.components || {}))
    fs.writeFileSync('out.json', JSON.stringify(doc, null, 4))
    return doc
}
