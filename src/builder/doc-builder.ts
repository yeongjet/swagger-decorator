import _, { pick } from 'lodash'
import fs from 'fs'
import { Type, storage } from '../storage'
import { OpenAPI } from '../common/open-api'
import { warning, isPrimitiveType, wrapBrace, set, enumToArray } from '../util'
import { ParameterLocation } from '../common'
import { PrimitiveClass } from '../common/type-fest'
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

    let schema: Record<string, any> = {}
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
        schema = { type: itemType, enum: items }
    }
    return schema
}

const transformParameterType = (models: any, parameter: any) => {
    let result: any = []
    if (isPrimitiveType(parameter.type)) {
        result.push({ ..._.pick(parameter, 'name', 'in', 'required'), schema: transformTypeToSchema(parameter) })
    } else {
        for(const [ propertyName, propertyValue ] of Object.entries(models[(parameter.type as TypeFest.Class<any>).name]) as any) {
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
const generateParameterObject = (models: any, bindingParameters: BindingParameter[], storageParameters: any) => {
    // handle @Headers('xx') @Param('xx') @Query('xx') in bindingParams
    const [ unnamedBindingParameters, namedBindingParameters ] = _.partition(bindingParameters.filter(n => n.type !== Object && n.in !== ParameterLocation.BODY), n => _.isNil(n.name)) as [UnnamedBindingParameter[], NamedBindingParameter[]]
    // handle @Header() @Query() @Param() in bindingParams
    _.filter(unnamedBindingParameters, n => !isPrimitiveType(n.type)).map(n => {
        for(const [ propertyName, propertyValue ] of Object.entries(models[(n.type as TypeFest.Class<any>).name]) as any) {
            if (!isPrimitiveType(propertyValue.type)) {
                warning(`properties(${propertyName}) in ${(n.type as TypeFest.Class<any>).name} will be ignored`)
                continue
            }
            namedBindingParameters.push({ name: propertyName, in: n.in, type: propertyValue.type, required: propertyValue.required })
        }
    })
    // all items in namedMetadataWithSchema has name, merge paramsMetadata and storageParams
    const namedStorageParameters = _.flatten(storageParameters.map(n => _.isNil(n.name) ? transformParameterType(models, n) : n))
    // merge @ApiHeader({ name: 'xx' }) @ApiParam({ name: 'xx' }) @ApiQuery({ name: 'xx' }) into binding parameters
    const result = _.flatten(namedBindingParameters.map(bindingParam => {
        const [ namedStorageParam ] = _.remove(namedStorageParameters, { name: bindingParam.name, in: bindingParam.in })
        if (namedStorageParam) {
            Object.assign(bindingParam, namedStorageParam)
        }
        return transformParameterType(models, bindingParam)
    })).concat(namedStorageParameters)
    return result
}

// handle @ApiBody({ type: xx }) @Body() @Body('xx')
const generateRequestBodyObject = (bindingParameters: BindingParameter[], storageBody: any, consumes: string[] = ['application/json']) => {
    const body = storageBody ?? bindingParameters.find(n => n.type !== Object && !(!_.isNil(n.name) && n.in === ParameterLocation.BODY))
    if (!body) {
        return
    }
    const content = consumes.reduce((acc, item) => ({
        ...acc,
        [item]: {
            ..._.pick(body, 'example', 'examples'),
            schema: {
                $ref: `#/components/schemas/${body?.type.constructor.name}`
            }
        }
    }), {})
    return {..._.pick(body, 'description', 'required'), content }
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
            const routeBinding = routeBindingGetter(controllerName, handlerName)
            const routePath = routePrefix + wrapBrace(routeBinding.url)
            let parameters: any, requestBody: any
            if (routeBinding.parameters) {
                const consumes = _.uniq([ ...controllerStorage.consumes, ...handlerStorage.consumes ])
                parameters = generateParameterObject(storage.models, routeBinding.parameters, handlerStorage.parameters)
                requestBody = generateRequestBodyObject(routeBinding.parameters, handlerStorage.body, consumes)
            }
            const httpMethod = routeBinding.httpMethod.toLowerCase()
            set(doc, `paths.${routePath}.${httpMethod}`, _.omitBy({
                parameters, requestBody,
                ..._.pick(controllerStorage, 'tags', 'responses', 'security'),
                ..._.pick(handlerStorage, 'responses') }, _.isNil))
        }
    }
    fs.writeFileSync('out.json', JSON.stringify(storage, null, 4))
    return
}
