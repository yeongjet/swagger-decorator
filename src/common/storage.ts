import { StatusCodes } from 'http-status-codes'
import { SetRequired, SetOptional, Class } from 'type-fest'
import { Operation, RequestBody, Reference } from './open-api'
import { Primitive } from './type-fest'
import { HttpMethod, PropertyKey } from './sundry'
import * as OpenApi from './open-api'

export type Type = Class<any> | Primitive

export type Enum = number[] | string[] | Record<number, string>

export type Schema = Omit<OpenApi.Schema, 'type' | 'allOf' | 'oneOf' | 'anyOf' | 'not' | 'items' | 'properties' | 'additionalProperties' | 'patternProperties' > & {
    type?: Type
    allOf?: (Schema | Reference)[]
    oneOf?: (Schema | Reference)[]
    anyOf?: (Schema | Reference)[]
    not?: Schema | Reference
    items?: Schema | Reference
    properties?: Record<string, Schema | Reference>
    additionalProperties?: Schema | Reference | boolean
    patternProperties?: Schema | Reference | any
}

export namespace Storage {
    export interface Response extends Omit<SetOptional<OpenApi.Response, 'description'>, 'content'> { status: StatusCodes, schema: Schema }

    interface CommonOperation extends SetRequired<Pick<Operation, 'tags' | 'summary' | 'description' | 'externalDocs' | 'security'>, 'tags' | 'security'> {
        headers: { name: string, schema: Schema }[]
        consumes: string[]
        produces: string[]
        responses: Response[]
    }
    
    export namespace Controller {
        export interface Route extends CommonOperation {
            name: PropertyKey
            url?: string
            method?: HttpMethod
            body?: Pick<RequestBody, 'description' | 'required'> & { schema: Schema }
            params: { name: string, schema: Schema }[]
            queries: { name?: string, schema: Schema }[]
        }
    }

    export interface Controller extends CommonOperation {
        routes: Controller.Route[]
    }

    export namespace Model {
        export interface Property {
            key: PropertyKey
            schema: Schema
        }
    }

    export interface Model {
        properties: Model.Property[]
    }
}

export type Storage = {
    models: Record<string, Storage.Model>
    controllers: Record<string, Storage.Controller>
}
