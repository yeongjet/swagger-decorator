import { StatusCodes } from 'http-status-codes'
import { SetRequired, SetOptional, Class } from 'type-fest'
import { Operation, Parameter, RequestBody, BaseParameter, Reference } from './open-api'
import { PrimitiveClass, PrimitiveString } from './type-fest'
import { HttpMethod, Property } from './sundry'
import * as OpenApi from './open-api'

export type PrimitiveType = PrimitiveClass | PrimitiveString

export type Type = Class<any> | PrimitiveType

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

export interface Header extends Pick<Parameter, 'name'> { schema: Schema }

export interface Param extends Pick<Parameter, 'name'> { schema: Schema }

export interface Body extends Pick<RequestBody, 'description' | 'required'> { schema: Schema }

export interface Query extends Omit<BaseParameter, 'schema'> { schema: Schema }

export interface Response extends Omit<SetOptional<OpenApi.Response, 'description'>, 'content'> { status: StatusCodes, schema: Schema }

interface CommonOperation extends SetRequired<Pick<Operation, 'tags' | 'summary' | 'description' | 'externalDocs' | 'security'>, 'tags' | 'security'> {
    headers: Header[]
    consumes: string[]
    produces: string[]
    responses: Response[]
}

export interface Route extends CommonOperation {
    name: Property
    url?: string
    method?: HttpMethod
    body?: Body
    params: Param[]
    queries: Query[]
}

export interface Controller extends CommonOperation {
    routes: Route[]
}

export type Storage = {
    schemas: Function[]
    controllers: Record<string, Controller>
}
