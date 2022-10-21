import { StatusCodes } from 'http-status-codes'
import { SetRequired, SetOptional } from 'type-fest'
import { OperationObject, RequestBodyObject, ParameterStyle, Example, Reference, Content, BaseParameter, ParameterLocation } from './common/open-api/openapi-spec-v3.1.0'
import { Class } from './common/type-fest'
import { HttpMethod, PropertyKey } from './common/sundry'
import * as OpenApi from './common/open-api'

export type Type = Class

export type Enum = number[] | string[] | Record<number, string>

export type Parameter = Omit<BaseParameter, 'schema'> & { name: string, schema: Schema, required: boolean }

export interface Response extends Omit<SetOptional<OpenApi.Response, 'description'>, 'content'> {
    status: StatusCodes
    schema: Schema
}

interface CommonOperation
    extends SetRequired<
        Pick<OperationObject, 'tags' | 'summary' | 'description' | 'externalDocs' | 'security'>,
        'tags' | 'security'
    > {
    headers:  Parameter[]
    consumes: string[]
    produces: string[]
    responses: Response[]
}

export interface Route extends CommonOperation {
    name: PropertyKey
    url?: string
    method?: HttpMethod
    body?: Pick<RequestBody, 'description' | 'required'> & { type: Type }
    params: Parameter[]
    queries: Parameter[]
}

export interface Controller extends CommonOperation {
    routes: Route[]
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
