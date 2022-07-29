export interface OpenAPI {
    openapi: string
    info: Info
    servers?: Server[]
    paths: Paths
    components?: Components
    security?: SecurityRequirement[]
    tags?: Tag[]
    externalDocs?: ExternalDocumentation
}

export interface Info {
    title: string
    description?: string
    termsOfService?: string
    contact?: Contact
    license?: License
    version: string
}

export interface Contact {
    name?: string
    url?: string
    email?: string
}

export interface License {
    name: string
    url?: string
}

export interface Server {
    url: string
    description?: string
    variables?: Record<string, ServerVariable>
}

export interface ServerVariable {
    enum?: string[] | boolean[] | number[]
    default: string | boolean | number
    description?: string
}

export interface Components {
    schemas?: Record<string, Schema | Reference>
    responses?: Record<string, Response | Reference>
    parameters?: Record<string, Parameter | Reference>
    examples?: Record<string, Example | Reference>
    requestBodies?: Record<string, RequestBody | Reference>
    headers?: Record<string, Header | Reference>
    securitySchemes?: Record<string, SecurityScheme | Reference>
    links?: Record<string, Link | Reference>
    callbacks?: Record<string, Callback | Reference>
}

export type Paths = Record<string, PathItem>
export interface PathItem {
    $ref?: string
    summary?: string
    description?: string
    get?: Operation
    put?: Operation
    post?: Operation
    delete?: Operation
    options?: Operation
    head?: Operation
    patch?: Operation
    trace?: Operation
    servers?: Server[]
    parameters?: (Parameter | Reference)[]
}

export interface Operation {
    tags?: string[]
    summary?: string
    description?: string
    externalDocs?: ExternalDocumentation
    operationId?: string
    parameters?: (Parameter | Reference)[]
    requestBody?: RequestBody | Reference
    responses: Responses
    callbacks?: Callbacks
    deprecated?: boolean
    security?: SecurityRequirement[]
    servers?: Server[]
}

export interface ExternalDocumentation {
    description?: string
    url: string
}

export type ParameterLocation = 'query' | 'header' | 'path' | 'cookie'
export type ParameterStyle = 'matrix' | 'label' | 'form' | 'simple' | 'spaceDelimited' | 'pipeDelimited' | 'deep'

export interface BaseParameter {
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: ParameterStyle
    explode?: boolean
    allowReserved?: boolean
    schema?: Schema | Reference
    examples?: Record<string, Example | Reference>
    example?: any
    content?: Content
}

export interface Parameter extends BaseParameter {
    name: string
    in: ParameterLocation
}

export interface RequestBody {
    description?: string
    content: Content
    required?: boolean
}

export type Content = Record<string, MediaType>
export interface MediaType {
    schema?: Schema | Reference
    examples?: Examples
    example?: any
    encoding?: Encoding
}

export type Encoding = Record<string, EncodingProperty>
export interface EncodingProperty {
    contentType?: string
    headers?: Record<string, Header | Reference>
    style?: string
    explode?: boolean
    allowReserved?: boolean
}

export interface Responses extends Record<string, Response | Reference | undefined> {
    default?: Response | Reference
}

export interface Response {
    description: string
    headers?: Headers
    content?: Content
    links?: Links
}

export type Callbacks = Record<string, Callback | Reference>
export type Callback = Record<string, PathItem>
export type Headers = Record<string, Header | Reference>

export interface Example {
    summary?: string
    description?: string
    value?: any
    externalValue?: string
}

export type Links = Record<string, Link | Reference>
export interface Link {
    operationRef?: string
    operationId?: string
    parameters?: LinkParameters
    requestBody?: any | string
    description?: string
    server?: Server
}

export type LinkParameters = Record<string, any>
export type Header = BaseParameter
export interface Tag {
    name: string
    description?: string
    externalDocs?: ExternalDocumentation
}

export type Examples = Record<string, Example | Reference>

export interface Reference {
    $ref: string
}

export interface Schema {
    nullable?: boolean
    discriminator?: Discriminator
    readOnly?: boolean
    writeOnly?: boolean
    xml?: Xml
    externalDocs?: ExternalDocumentation
    example?: any
    examples?: any[] | Record<string, any>
    deprecated?: boolean
    type?: string
    allOf?: (Schema | Reference)[]
    oneOf?: (Schema | Reference)[]
    anyOf?: (Schema | Reference)[]
    not?: Schema | Reference
    items?: Schema | Reference
    properties?: Record<string, Schema | Reference>
    additionalProperties?: Schema | Reference | boolean
    patternProperties?: Schema | Reference | any
    description?: string
    format?: string
    default?: any
    title?: string
    multipleOf?: number
    maximum?: number
    exclusiveMaximum?: boolean
    minimum?: number
    exclusiveMinimum?: boolean
    maxLength?: number
    minLength?: number
    pattern?: string
    maxItems?: number
    minItems?: number
    uniqueItems?: boolean
    maxProperties?: number
    minProperties?: number
    required?: string[]
    enum?: any[]
}

export type Schemas = Record<string, Schema>

export interface Discriminator {
    propertyName: string
    mapping?: Record<string, string>
}

export interface Xml {
    name?: string
    namespace?: string
    prefix?: string
    attribute?: boolean
    wrapped?: boolean
}

export type SecuritySchemeType = 'apiKey' | 'http' | 'oauth2' | 'openIdConnect'

export interface SecurityScheme {
    type: SecuritySchemeType
    description?: string
    name?: string
    in?: string
    scheme?: string
    bearerFormat?: string
    flows?: OAuthFlows
    openIdConnectUrl?: string
}

export interface OAuthFlows {
    implicit?: OAuthFlow
    password?: OAuthFlow
    clientCredentials?: OAuthFlow
    authorizationCode?: OAuthFlow
}

export interface OAuthFlow {
    authorizationUrl?: string
    tokenUrl?: string
    refreshUrl?: string
    scopes: Scopes
}

export type Scopes = Record<string, any>
export type SecurityRequirement = Record<string, string[]>
