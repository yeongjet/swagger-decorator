import { StatusCodes } from 'http-status-codes'
import { Operation, Parameter, Schema, RequestBody, BaseParameter } from './open-api'
import { RequestMethod } from './constant'
import { SetRequired, SetOptional, Class } from 'type-fest'
import { PrimitiveClass, PrimitiveString, MergeExclusive3 } from './type-fest'
import * as OpenApi from './open-api'

export type Enum = MergeExclusive3<string[], number[], Record<string, number>>

export type Property = string | symbol

export type PartialRequired<T, K extends keyof T> = Required<Pick<T, K>> & Partial<Omit<T, K>>

export type Type = Class<any> | PrimitiveClass | PrimitiveString

export interface Header extends Pick<Parameter, 'name'> { schema: Schema }

export interface Param extends Pick<Parameter, 'name'> { schema: Schema }

export type ClassicTypeSchema = Omit<Schema, 'type' | 'items'> & { type?: Type, items?: ClassicTypeSchema }

export interface Body extends Pick<RequestBody, 'description' | 'required'> { schema: ClassicTypeSchema }

export interface Query extends Omit<BaseParameter, 'schema'> { schema: ClassicTypeSchema }

export interface Response extends Omit<SetOptional<OpenApi.Response, 'description'>, 'content'> { status: StatusCodes, schema: ClassicTypeSchema }

// export interface Property extends Merge<Pick<RequestBody, 'description' | 'required'>, { schema: Merge<Schema, { type?: Type }> }> {}

interface CommonOperation extends SetRequired<Pick<Operation, 'tags' | 'summary' | 'description' | 'externalDocs' | 'responses' | 'security'>, 'tags' | 'security'> {
    headers: Header[]
    consumes: string[]
    produces: string[]
}

export interface Route extends CommonOperation {
    name: Property
    url?: string
    method?: RequestMethod
    body: Body
    params: Param[]
    queries: Query[]
}

export interface Controller extends CommonOperation {
    name: string
    prefix: string
    routes: Route[]
}

export type Storage = {
    schemas: Function[]
    controllers: Record<string, Controller>
}