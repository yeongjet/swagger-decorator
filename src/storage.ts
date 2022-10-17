import { StatusCodes } from 'http-status-codes'
import { SetRequired, SetOptional } from 'type-fest'
import { Operation, RequestBody, ParameterStyle, Example, Reference, Content, BaseParameter } from './common/open-api'
import { Class } from './common/type-fest'
import { HttpMethod, PropertyKey } from './common/sundry'
import * as OpenApi from './common/open-api'

export type Type = Class

export type Enum = number[] | string[] | Record<number, string>

export type Schema = Omit<
    OpenApi.Schema,
    | 'type'
    | 'required'
    | 'allOf'
    | 'oneOf'
    | 'anyOf'
    | 'not'
    | 'items'
    | 'properties'
    | 'additionalProperties'
    | 'patternProperties'
> & {
    type: Type
    allOf?: (Schema | Reference)[]
    oneOf?: (Schema | Reference)[]
    anyOf?: (Schema | Reference)[]
    not?: Schema | Reference
    items?: Schema | Reference
    properties?: Record<string, Schema | Reference>
    additionalProperties?: Schema | Reference | boolean
    patternProperties?: Schema | Reference | any
}

// const openApiVersion = '3.1.0'
// {
//     openapi: openApiVersion,
//     info: {
//         title: '',
//         version: ''
//     },
//     paths:{}
// }

// let storage: Storage = {
//     models: {
//         'xxx': {
//             properties: [
//                 {
//                     name: 'abc',
//                     schema: {
//                         type: Number
//                     },
//                     required: true
//                 }
//             ]
//         }
//     },
//     controllers: {
//         'xxx': {
//             headers: [],
//             routes: [{
//                 name: 'stes',
//                 params: [],
//                 body: {}
//             }]
//         }
//     }
// }

export type Parameter = Omit<BaseParameter, 'schema'> & { name: string, schema: Schema }

export interface Response extends Omit<SetOptional<OpenApi.Response, 'description'>, 'content'> {
    status: StatusCodes
    schema: Schema
}

interface CommonOperation
    extends SetRequired<
        Pick<Operation, 'tags' | 'summary' | 'description' | 'externalDocs' | 'security'>,
        'tags' | 'security'
    > {
    headers:  Parameter[]
    consumes: string[]
    produces: string[]
    responses: Response[]
}

export interface ControllerRoute extends CommonOperation {
    name: PropertyKey
    url?: string
    method?: HttpMethod
    body?: Pick<RequestBody, 'description' | 'required'> & { schema: Schema }
    params: Parameter[]
    queries: Parameter[]
}

export interface Controller extends CommonOperation {
    routes: ControllerRoute[]
}

export type Storage = {
    models: Record<
        string,
        {
            properties: {
                name: string
                schema: Schema
                description?: string
                required: boolean
                deprecated?: boolean
                allowEmptyValue?: boolean
                style?: ParameterStyle
                explode?: boolean
                allowReserved?: boolean
                examples?: Record<string, Example | Reference>
                example?: any
                content?: Content
            }[]
        }
    >
    controllers: Record<string, Controller>
}

export const storage: Storage = {
    models: {},
    controllers: {}
}
