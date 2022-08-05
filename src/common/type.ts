import { Response, Operation, ExternalDocumentation, Responses, SecurityRequirement, Schema, Parameter, Reference } from './open-api'
import { RequestMethod } from './constant'

export type Property = string | symbol

export type PartialRequired<T, K extends keyof T> = Required<Pick<T, K>> & Partial<Omit<T, K>>

export interface Header {
    name: string
    description?: string
    required?: boolean
    schema: Schema
}

export interface Route {
    name: Property
    url?: string
    requestMethod?: RequestMethod
    consumes: string[]
    headers: Header[]
    tags: string[]
    summary?: string
    description?: string
    externalDocs?: ExternalDocumentation,
    parameters?: (Parameter | Reference)[],
    responses: Responses
    security: SecurityRequirement[]
    deprecated?: boolean
}

export interface Controller {
    name: string
    prefix: string
    routes: Route[]
    consumes: string[]
    headers: Header[]
    tags: string[]
    summary?: string
    description?: string
    externalDocs?: ExternalDocumentation,
    responses: Responses
    security: SecurityRequirement[]
}

export type Storage = {
    schemas: Function[]
    controllers: Record<string, Controller>
}