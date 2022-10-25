import _ from 'lodash'
import fs from 'fs'
import { storage } from '../storage'
import { OpenAPI, RequestBodyObject } from '../common/open-api'
import { warning, isPrimitive, wrapBrace, set, enumToArray, remove } from '../util'
import { Type, ParameterLocation } from '../common'
import TypeFest from 'type-fest'

type BindingParameter = { name?: string; in: `${ParameterLocation}`; type: Type }
type NamedBindingParameter = BindingParameter & { name: string, required?: boolean }
type UnnamedBindingParameter = Omit<BindingParameter, 'name'>

export type BuildDocumentOption = {
    title?: string
    version?: string
    routePrefixGetter?: (controllerName: string) => string
    routeBindingGetter: (controllerName: string, routeName: string) => { httpMethod: string; url: string; parameters?: BindingParameter[] }
}

const transformTypeToSchema = (parameter: any) => {
    let schema: Record<string, any> = _.pick(parameter, 'required')
    if (!_.isNil(parameter.type)) {
        const isArray = _.isArray(parameter.type)
        const type = isArray ? parameter.type.at(0) : parameter.type
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
        const { itemType, items } = enumToArray(parameter.enum)
        schema.type = itemType
        schema.enum = items
    }
    return schema
}

const transformParameterType = (component: any, parameter: any) => {
    let result: any = []
    if (isPrimitive(parameter.type)) {
        result.push({ ..._.pick(parameter, 'name', 'in', 'required'), schema: transformTypeToSchema(parameter) })
    } else {
        for(const [ propertyName, propertyValue ] of Object.entries(component) as any) {
            result.push({ name: propertyName, ..._.pick(parameter, 'in', 'required'), ..._.pick(propertyValue, 'required'), schema: transformTypeToSchema(propertyValue) })
        }
    }
    return result
}

// bindingParams: @Body() @Headers() @Param() @Query() @Body('xx') @Headers('xx') @Param('xx') @Query('xx')
// routeStorage: @ApiBody({ type: xx }) @ApiHeader({ name: 'xx' }) @ApiParam({ name: 'xx' }) @ApiQuery() @ApiQuery({ name: 'xx' })
// @ApiHeader name:必须 type: string
// @ApiParam name:必须 type:可选
// @ApiQuery name:可选 type:可选
// @ApiBody name:无 type: object

// handle @Headers() @Param() @Query() @Headers('xx') @Param('xx') @Query('xx') @ApiHeader({ name: 'xx' }) @ApiParam({ name: 'xx' }) @ApiQuery() @ApiQuery({ name: 'xx' })
const generateParametersObject = (components: any, bindingParameters: BindingParameter[], storageParameters: any) => {
    const [ unnamedBindingParameters, namedBindingParameters ] = _.partition(bindingParameters.filter(n => n.type !== Object && n.in !== ParameterLocation.BODY), n => _.isNil(n.name)) as [UnnamedBindingParameter[], NamedBindingParameter[]]
    _.filter(unnamedBindingParameters, n => !isPrimitive(n.type)).map(n => {
        const componentName = (n.type as TypeFest.Class<any>).name
        const component = remove(components, componentName)
        for(const [ propertyName, propertyValue ] of Object.entries(component) as any) {
            if (!isPrimitive(propertyValue.type)) {
                warning(`properties(${propertyName}) in ${componentName} will be ignored`)
                continue
            }
            namedBindingParameters.push({ name: propertyName, in: n.in, type: propertyValue.type, required: propertyValue.required })
        }
    })
    const namedStorageParameters = _.flatten(storageParameters.map(n => _.isNil(n.name) ? transformParameterType(remove(components, n.type.name), n) : n))
    const result = _.flatten(namedBindingParameters.map(bindingParam => {
        const [ namedStorageParam ] = _.remove(namedStorageParameters, { name: bindingParam.name, in: bindingParam.in })
        if (namedStorageParam) {
            Object.assign(bindingParam, namedStorageParam)
        }
        return transformParameterType(remove(components, (bindingParam.type as TypeFest.Class<any>).name), bindingParam)
    })).concat(namedStorageParameters)
    return result
}

// handle @ApiBody({ type: xx }) @Body() @Body('xx')
const generateRequestBodyObject = (bindingParameters: BindingParameter[], storageBody: any, consumes: string[]): RequestBodyObject | void => {
    const body = storageBody ?? bindingParameters.find(n => n.type !== Object && !(!_.isNil(n.name) && n.in === ParameterLocation.BODY))
    if (_.isEmpty(body)) {
        return
    }
    const content = consumes.reduce((acc, item) => ({
        ...acc,
        [item]: {
            schema: {
                $ref: `#/components/schemas/${body.type.constructor.name}`
            }
        }
    }), {})
    return {..._.pick(body, 'description', 'required'), content }
}

const generateResponsesObject = (storageResponse: any, produces: string[]) => {
    return produces.reduce((pacc, pitem: any) => {
        const response = { ...pacc, [pitem.status]: _.pick(pitem, 'description', 'headers', 'links') }
        if (pitem.type) {
            const content = produces.reduce((acc, item) => ({
                ...acc,
                [item]: {
                    ..._.pick(storageResponse, 'example', 'examples'),
                    schema: {
                        $ref: `#/components/schemas/${pitem?.type.constructor.name}`
                    }
                }
            }), {})
            Object.assign(response, content)
        }
        return response
    }, {})
}

const generateComponentsObject = (storageComponents: any) => {
    const components = {}
    for(const [ componentName, componentProperty ] of Object.entries(storageComponents)) {
        for(const [ propertyName, propertyValue ] of Object.entries(componentProperty as any)) {
            set(components, `schema.${componentName}.properties.${propertyName}`, transformTypeToSchema(propertyValue))
        }
        const required = _.reduce(componentProperty as any, (acc, value, key) => value.required ? acc.concat(key) : acc, [] as string[]);
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
    for (const [controllerName, controllerStorage] of Object.entries(storage.controllers) as any) {
        const routePrefix = routePrefixGetter ? routePrefixGetter(controllerName) : ''
        for (const [handlerName, handlerStorage] of Object.entries(controllerStorage.handlers) as any) {
            const consumes = handlerStorage.consumes || controllerStorage.consumes || ['application/json']
            const produces = handlerStorage.produces || controllerStorage.produces || ['application/json']
            const routeBinding = routeBindingGetter(controllerName, handlerName)
            const parameters = generateParametersObject(storage.components, routeBinding.parameters || [], handlerStorage.parameters || [])
            const requestBody = generateRequestBodyObject(routeBinding.parameters || [], handlerStorage.body, consumes)
            const responses = generateResponsesObject(handlerStorage.responses, produces)
            const httpMethod = routeBinding.httpMethod.toLowerCase()
            const routePath = routePrefix + wrapBrace(routeBinding.url)
            set(doc, `paths.${routePath}.${httpMethod}`, _.omitBy({ parameters, requestBody, responses, ..._.pick(controllerStorage, 'tags', 'security')}, _.isEmpty))
        }
    }
    set(doc, `components`, generateComponentsObject(storage.components))
    fs.writeFileSync('out.json', JSON.stringify(doc, null, 4))
    return doc
}
