import { Operation, Parameter, Schema } from './open-api'
import { RequestMethod } from './constant'
import { Merge, SetRequired } from 'type-fest'

export type Property = string | symbol

export type PartialRequired<T, K extends keyof T> = Required<Pick<T, K>> & Partial<Omit<T, K>>

export interface Header extends Merge<Pick<Parameter, 'name'>, { schema: Schema }> {}

export interface Param extends Merge<Parameter, { schema: Schema }> {}

type OperationPicksForRoute = 'tags' | 'summary' | 'description' | 'externalDocs' | 'parameters' | 'requestBody' | 'responses' | 'security'

type OperationPicksForController = 'tags' | 'summary' | 'description' | 'externalDocs' | 'responses' | 'security'

export interface Route extends SetRequired<Pick<Operation, OperationPicksForRoute>, 'tags' | 'parameters' | 'security'> {
    name: Property
    url?: string
    requestMethod?: RequestMethod
    consumes: string[]
    headers: Header[]
}

export interface Controller extends SetRequired<Pick<Operation, OperationPicksForController>, 'tags' | 'security'> {
    name: string
    prefix: string
    routes: Route[]
    consumes: string[]
    headers: Header[]
}

export type Storage = {
    schemas: Function[]
    controllers: Record<string, Controller>
}