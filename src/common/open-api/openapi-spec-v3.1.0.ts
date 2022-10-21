export interface OpenAPI {
    openapi: string // REQUIRED. This string MUST be the version number of the OpenAPI Specification that the OpenAPI document uses. The openapi field SHOULD be used by tooling to interpret the OpenAPI document. This is not related to the API info.version string.
    info: InfoObject // REQUIRED. Provides metadata about the API. The metadata MAY be used by tooling as required.
    jsonSchemaDialect?: string // The default value for the $schema keyword within Schema Objects contained within this OAS document. This MUST be in the form of a URI.
    servers?: ServerObject[] // An array of Server Objects, which provide connectivity information to a target server. If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of /.
    paths?: PathsObject // The available paths and operations for the API.
    webhooks?: Record<string, PathItemObject | ReferenceObject> // The incoming webhooks that MAY be received as part of this API and that the API consumer MAY choose to implement. Closely related to the callbacks feature, this section describes requests initiated other than by an API call, for example by an out of band registration. The key name is a unique string to refer to each webhook, while the (optionally referenced) Path Item Object describes a request that may be initiated by the API provider and the expected responses. An example is available.
    components?: ComponentsObject // An element to hold various schemas for the document.
    security?: SecurityRequirementObject[] // A declaration of which security mechanisms can be used across the API. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. Individual operations can override this definition. To make security optional, an empty security requirement ({}) can be included in the array.
    tags?: TagObject[] // A list of tags used by the document with additional metadata. The order of the tags can be used to reflect on their order by the parsing tools. Not all tags that are used by the Operation Object must be declared. The tags that are not declared MAY be organized randomly or based on the tools’ logic. Each tag name in the list MUST be unique.
    externalDocs: ExternalDocumentationObject // Additional external documentation.
}

// in OpenAPI->(info:InfoObject)
export interface InfoObject {
    title: string // REQUIRED. The title of the API.
    summary?: string // A short summary of the API.
    description?: string // A description of the API. CommonMark syntax MAY be used for rich text representation.
    termsOfService?: string // A URL to the Terms of Service for the API. This MUST be in the form of a URL.
    contact?: ContactObject  // The contact information for the exposed API.
    license?: LicenseObject // The license information for the exposed API.
    version: string // REQUIRED. The version of the OpenAPI document (which is distinct from the OpenAPI Specification version or the API implementation version).
}

// OpenAPI->(info:InfoObject)->(contact:ContactObject)
export interface ContactObject {
    name?: string // The identifying name of the contact person/organization.
    url?: string // The URL pointing to the contact information. This MUST be in the form of a URL.
    email?: string // The email address of the contact person/organization. This MUST be in the form of an email address.
}

// OpenAPI->(info:InfoObject)->(license:LicenseObject)
export interface LicenseObject {
    name: string // REQUIRED. The license name used for the API.
    identifier?: string // An SPDX license expression for the API. The identifier field is mutually exclusive of the url field.
    url?: string // A URL to the license used for the API. This MUST be in the form of a URL. The url field is mutually exclusive of the identifier field.
}

// OpenAPI->(servers:ServerObject)
export interface ServerObject {
    url: string // REQUIRED. A URL to the target host. This URL supports Server Variables and MAY be relative, to indicate that the host location is relative to the location where the OpenAPI document is being served. Variable substitutions will be made when a variable is named in {brackets}.
    description: string // An optional string describing the host designated by the URL. CommonMark syntax MAY be used for rich text representation.
    variables: Record<string, ServerVariableObject> // A map between a variable name and its value. The value is used for substitution in the server’s URL template.
}

// OpenAPI->(servers:ServerObject)->variables
export interface ServerVariableObject {
    enum?: string[] // An enumeration of string values to be used if the substitution options are from a limited set. The array MUST NOT be empty.
    default: string // REQUIRED. The default value to use for substitution, which SHALL be sent if an alternate value is not supplied. Note this behavior is different than the Schema Object’s treatment of default values, because in those cases parameter values are optional. If the enum is defined, the value MUST exist in the enum’s values.
    description?: string // An optional description for the server variable. CommonMark syntax MAY be used for rich text representation.
}

// OpenAPI->(paths:PathsObject)
export interface PathsObject extends Record<string, PathItemObject> {}

// OpenAPI->(paths:PathsObject)->({url}:PathItemObject)
export interface PathItemObject {
    $ref?: string // Allows for a referenced definition of this path item. The referenced structure MUST be in the form of a Path Item Object. In case a Path Item Object field appears both in the defined object and the referenced object, the behavior is undefined. See the rules for resolving Relative References.
    summary?: string // An optional, string summary, intended to apply to all operations in this path.
    description?: string // An optional, string description, intended to apply to all operations in this path. CommonMark syntax MAY be used for rich text representation.
    get?: OperationObject // A definition of a GET operation on this path.
    put?: OperationObject // A definition of a PUT operation on this path.
    post?: OperationObject // A definition of a POST operation on this path.
    delete?: OperationObject // A definition of a DELETE operation on this path.
    options?: OperationObject // A definition of a OPTIONS operation on this path.
    head?: OperationObject // A definition of a HEAD operation on this path.
    patch?: OperationObject // A definition of a PATCH operation on this path.
    trace?: OperationObject // A definition of a TRACE operation on this path.
    servers?: ServerObject[] // An alternative server array to service all operations in this path.
    parameters?: (ParameterObject | ReferenceObject)[] // A list of parameters that are applicable for all the operations described under this path. These parameters can be overridden at the operation level, but cannot be removed there. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object’s components/parameters.
}

// OpenAPI->(paths:PathsObject)->({url}:PathItemObject)->{http method}
export interface OperationObject {
    tags?: string[] // A list of tags for API documentation control. Tags can be used for logical grouping of operations by resources or any other qualifier.
    summary?: string // A short summary of what the operation does.
    description?: string // A verbose explanation of the operation behavior. CommonMark syntax MAY be used for rich text representation.
    externalDocs?: ExternalDocumentationObject // Additional external documentation for this operation.
    operationId?: string // Unique string used to identify the operation. The id MUST be unique among all operations described in the API. The operationId value is case-sensitive. Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow common programming naming conventions.
    parameters?: (ParameterObject | ReferenceObject)[] // A list of parameters that are applicable for this operation. If a parameter is already defined at the Path Item, the new definition will override it but can never remove it. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object’s components/parameters.
    requestBody?: RequestBodyObject | ReferenceObject // The request body applicable for this operation. The requestBody is fully supported in HTTP methods where the HTTP 1.1 specification [RFC7231] has explicitly defined semantics for request bodies. In other cases where the HTTP spec is vague (such as GET, HEAD and DELETE), requestBody is permitted but does not have well-defined semantics and SHOULD be avoided if possible.
    responses?: ResponsesObject // The list of possible responses as they are returned from executing this operation.
    callbacks?: Record<string, CallbackObject | ReferenceObject> // A map of possible out-of band callbacks related to the parent operation. The key is a unique identifier for the Callback Object. Each value in the map is a Callback Object that describes a request that may be initiated by the API provider and the expected responses.
    deprecated?: boolean // Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the declared operation. Default value is false.
    security?: SecurityRequirementObject[] // A declaration of which security mechanisms can be used for this operation. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. To make security optional, an empty security requirement ({}) can be included in the array. This definition overrides any declared top-level security. To remove a top-level security declaration, an empty array can be used.
    servers?: ServerObject[] // An alternative server array to service this operation. If an alternative server object is specified at the Path Item Object or Root level, it will be overridden by this value.
}

// OpenAPI->(paths:PathsObject)>({url}:PathItemObject)->{http method}->(externalDocs:ExternalDocumentationObject)
export interface ExternalDocumentationObject {
    description?: string // A description of the target documentation. CommonMark syntax MAY be used for rich text representation.
    url: string // REQUIRED. The URL for the target documentation. This MUST be in the form of a URL.
}

// OpenAPI->(paths:PathsObject)>({url}:PathItemObject)->{http method}->parameters
// OpenAPI->(paths:PathsObject)>({url}:PathItemObject)->parameters
export interface ParameterObject {
    name: string //REQUIRED. The name of the parameter. Parameter names are case sensitive.
                 // If in is "path", the name field MUST correspond to a template expression occurring within the path field in the Paths Object. See Path Templating for further information.
                 // If in is "header" and the name field is "Accept", "Content-Type" or "Authorization", the parameter definition SHALL be ignored.
                 // For all other cases, the name corresponds to the parameter name used by the in property.
    in: string // REQUIRED. The location of the parameter. Possible values are "query", "header", "path" or "cookie".
    description?: string // A brief description of the parameter. This could contain examples of use. CommonMark syntax MAY be used for rich text representation.
    required?: boolean // Determines whether this parameter is mandatory. If the parameter location is "path", this property is REQUIRED and its value MUST be true. Otherwise, the property MAY be included and its default value is false.
    deprecated?: boolean // Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. Default value is false.
    allowEmptyValue?: boolean // Sets the ability to pass empty-valued parameters. This is valid only for query parameters and allows sending a parameter with an empty value. Default value is false. If style is used, and if behavior is n/a (cannot be serialized), the value of allowEmptyValue SHALL be ignored. Use of this property is NOT RECOMMENDED, as it is likely to be removed in a later revision.
    style?: string // Describes how the parameter value will be serialized depending on the type of the parameter value. Default values (based on value of in): for query - form; for path - simple; for header - simple; for cookie - form.
    explode?: boolean // When this is true, parameter values of type array or object generate separate parameters for each value of the array or key-value pair of the map. For other types of parameters this property has no effect. When style is form, the default value is true. For all other styles, the default value is false.
    allowReserved?: boolean // Determines whether the parameter value SHOULD allow reserved characters, as defined by [RFC3986] :/?#[]@!$&'()*+,;= to be included without percent-encoding. This property only applies to parameters with an in value of query. The default value is false.
    schema?: SchemaObject // The schema defining the type used for the parameter.
    example?: any // Example of the parameter’s potential value. The example SHOULD match the specified schema and encoding properties if present. The example field is mutually exclusive of the examples field. Furthermore, if referencing a schema that contains an example, the example value SHALL override the example provided by the schema. To represent examples of media types that cannot naturally be represented in JSON or YAML, a string value can contain the example with escaping where necessary.
    examples?: Record<string,  ExampleObject | ReferenceObject> // Examples of the parameter’s potential value. Each example SHOULD contain a value in the correct format as specified in the parameter encoding. The examples field is mutually exclusive of the example field. Furthermore, if referencing a schema that contains an example, the examples value SHALL override the example provided by the schema.
    content?: Record<string, MediaTypeObject> // A map containing the representations for the parameter. The key is the media type and the value describes it. The map MUST only contain one entry.
}

// Reference: https://json-schema.org/draft/2020-12/json-schema-validation.html
//            https://json-schema.org/draft/2020-12/json-schema-core.html
export interface SchemaObject {
    // (From: json-schema-validation) Validation Keywords for Any Instance Type
    type?: string
    enum?: any[]
    const?: any
    // (From: json-schema-validation) Validation Keywords for Numeric Instances (number and integer)
    multipleOf?: number
    maximum?: number
    exclusiveMaximum?: boolean
    minimum?: number
    exclusiveMinimum?: boolean
    // (From: json-schema-validation) Validation Keywords for Strings
    maxLength?: number
    minLength?: number
    pattern?: string
    // (From: json-schema-validation) Validation Keywords for Arrays
    maxItems?: number
    minItems?: number
    uniqueItems?: boolean
    maxContains?: number
    minContains?: number
    // (From: json-schema-validation) Validation Keywords for Objects
    maxProperties?: number
    minProperties?: number
    required?: string[]
    dependentRequired?: Record<string, string[]>
    // (From: json-schema-validation) Format
    format?: string
    // (From: json-schema-validation) Basic Meta-Data Annotations
    title?: string
    description?: string
    default?: any
    deprecated?: boolean
    readOnly?: boolean
    writeOnly?: boolean
    examples?: any[]
    // (From: json-schema-core) Keywords for Applying Subschemas in Place
    allOf: (SchemaObject | ReferenceObject)[]
    anyOf: (SchemaObject | ReferenceObject)[]
    oneOf: (SchemaObject | ReferenceObject)[]
    not: SchemaObject | ReferenceObject
    if: SchemaObject | ReferenceObject
    then: SchemaObject | ReferenceObject
    else: SchemaObject | ReferenceObject
    dependentSchemas: Record<string, SchemaObject | ReferenceObject>
    // (From: json-schema-core) Keywords for Applying Subschemas to Child Instances
    prefixItems?: (SchemaObject | ReferenceObject)[]
    items?: SchemaObject | ReferenceObject
    contains?: SchemaObject | ReferenceObject
    properties?: Record<string, SchemaObject | ReferenceObject>
    patternProperties?: Record<string, SchemaObject | ReferenceObject>
    additionalProperties?: SchemaObject | ReferenceObject
    propertyNames?: SchemaObject | ReferenceObject
    // The OpenAPI Specification’s base vocabulary
    discriminator: DiscriminatorObject // Adds support for polymorphism. The discriminator is an object name that is used to differentiate between other schemas which may satisfy the payload description. See Composition and Inheritance for more details.
    xml: XMLObject // This MAY be used only on properties schemas. It has no effect on root schemas. Adds additional metadata to describe the XML representation of this property.
    externalDocs: ExternalDocumentationObject	// Additional external documentation for this schema.
}

export interface DiscriminatorObject {
    propertyName: string // REQUIRED. The name of the property in the payload that will hold the discriminator value.
    mapping?: Record<string, string>	// An object to hold mappings between payload values and schema names or references.
}

export interface XMLObject {
    name?: string	// Replaces the name of the element/attribute used for the described schema property. When defined within items, it will affect the name of the individual XML elements within the list. When defined alongside type being array (outside the items), it will affect the wrapping element and only if wrapped is true. If wrapped is false, it will be ignored.
    namespace?: string	// The URI of the namespace definition. This MUST be in the form of an absolute URI.
    prefix?: string	// The prefix to be used for the name.
    attribute?: boolean	// Declares whether the property definition translates to an attribute instead of an element. Default value is false.
    wrapped?: boolean	// MAY be used only for an array definition. Signifies whether the array is wrapped (for example, <books><book/><book/></books>) or unwrapped (<book/><book/>). Default value is false. The definition takes effect only when defined alongside type being array (outside the items).
}

// OpenAPI->webhooks->{string}
// OpenAPI->(paths:PathsObject)>({url}:PathItemObject)->parameters
// OpenAPI->(paths:PathsObject)>({url}:PathItemObject)->{http method}->parameters
// OpenAPI->(paths:PathsObject)>({url}:PathItemObject)->{http method}->(parameters:ParameterObject[])->examples->{string}
// OpenAPI->(paths:PathsObject)>({url}:PathItemObject)->{http method}->requestBody
// OpenAPI->(paths:PathsObject)>({url}:PathItemObject)->{http method}->callbacks->{string}
export interface ReferenceObject {
    $ref: string	// REQUIRED. The reference identifier. This MUST be in the form of a URI.
    summary?: string // A short summary which by default SHOULD override that of the referenced component. If the referenced object-type does not allow a summary field, then this field has no effect.
    description?: string // A description which by default SHOULD override that of the referenced component. CommonMark syntax MAY be used for rich text representation. If the referenced object-type does not allow a description field, then this field has no effect.
}

export interface RequestBodyObject {
    description?: string	// A brief description of the request body. This could contain examples of use. CommonMark syntax MAY be used for rich text representation.
    content: Record<string, MediaTypeObject>	// REQUIRED. The content of the request body. The key is a media type or media type range and the value describes it. For requests that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text/*
    required?: boolean	// Determines if the request body is required in the request. Defaults to false.
}

export interface MediaTypeObject {
    example?: any // Example of the media type. The example object SHOULD be in the correct format as specified by the media type. The example field is mutually exclusive of the examples field. Furthermore, if referencing a schema which contains an example, the example value SHALL override the example provided by the schema.
    examples?: Record<string, ExampleObject | ReferenceObject> // Examples of the media type. Each example object SHOULD match the media type and specified schema if present. The examples field is mutually exclusive of the example field. Furthermore, if referencing a schema which contains an example, the examples value SHALL override the example provided by the schema.
    encoding?: Record<string, EncodingObject> // A map between a property name and its encoding information. The key, being the property name, MUST exist in the schema as a property. The encoding object SHALL only apply to requestBody objects when the media type is multipart or application/x-www-form-urlencoded.
}

export interface ExampleObject {
    summary?: string // Short description for the example.
    description?: string // Long description for the example. CommonMark syntax MAY be used for rich text representation.
    value?: any // Embedded literal example. The value field and externalValue field are mutually exclusive. To represent examples of media types that cannot naturally represented in JSON or YAML, use a string value to contain the example, escaping where necessary.
    externalValue?: string // A URI that points to the literal example. This provides the capability to reference examples that cannot easily be included in JSON or YAML documents. The value field and externalValue field are mutually exclusive. See the rules for resolving Relative References.
}

export interface EncodingObject {
    contentType?: string // The Content-Type for encoding a specific property. Default value depends on the property type: for object - application/json; for array – the default is defined based on the inner type; for all other cases the default is application/octet-stream. The value can be a specific media type (e.g. application/json), a wildcard media type (e.g. image/*), or a comma-separated list of the two types.
    headers?: Record<string, HeaderObject | ReferenceObject> // A map allowing additional information to be provided as headers, for example Content-Disposition. Content-Type is described separately and SHALL be ignored in this section. This property SHALL be ignored if the request body media type is not a multipart.
    style?: string // Describes how a specific property value will be serialized depending on its type. See Parameter Object for details on the style property. The behavior follows the same values as query parameters, including default values. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored.
    explode?: boolean // When this is true, property values of type array or object generate separate parameters for each value of the array, or key-value-pair of the map. For other types of properties this property has no effect. When style is form, the default value is true. For all other styles, the default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored.
    allowReserved?: boolean	// Determines whether the parameter value SHOULD allow reserved characters, as defined by [RFC3986] :/?#[]@!$&'()*+,;= to be included without percent-encoding. The default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored.
}

export interface HeaderObject extends Omit<ParameterObject, 'name' | 'in'> {}

export interface ResponsesObject extends Record<string, ResponseObject | ReferenceObject | undefined> {
    default?: ResponseObject | ReferenceObject
}

export interface ResponseObject {
    description: string	// REQUIRED. A description of the response. CommonMark syntax MAY be used for rich text representation.
    headers?: Record<string, HeaderObject | ReferenceObject>	// Maps a header name to its definition. [RFC7230] states header names are case insensitive. If a response header is defined with the name "Content-Type", it SHALL be ignored.
    content?: Record<string, MediaTypeObject>	// A map containing descriptions of potential response payloads. The key is a media type or media type range and the value describes it. For responses that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text/*
    links?: Record<string, LinkObject | ReferenceObject> // A map of operations links that can be followed from the response. The key of the map is a short name for the link, following the naming constraints of the names for Component Objects.
}

export interface LinkObject {
    operationRef?: string	// A relative or absolute URI reference to an OAS operation. This field is mutually exclusive of the operationId field, and MUST point to an Operation Object. Relative operationRef values MAY be used to locate an existing Operation Object in the OpenAPI definition. See the rules for resolving Relative References.
    operationId?: string	// The name of an existing, resolvable OAS operation, as defined with a unique operationId. This field is mutually exclusive of the operationRef field.
    parameters?: Record<string, any> // A map representing parameters to pass to an operation as specified with operationId or identified via operationRef. The key is the parameter name to be used, whereas the value can be a constant or an expression to be evaluated and passed to the linked operation. The parameter name can be qualified using the parameter location [{in}.]{name} for operations that use the same parameter name in different locations (e.g. path.id).
    requestBody?: any	// A literal value or {expression} to use as a request body when calling the target operation.
    description?: string	// A description of the link. CommonMark syntax MAY be used for rich text representation.
    server?: ServerObject // A server object to be used by the target operation.
}

export interface CallbackObject extends Record<string, PathItemObject | ReferenceObject> {}

export interface SecurityRequirementObject extends Record<string, string[]> {}

export interface ComponentsObject {
    schemas?: Record<string, SchemaObject>	// An object to hold reusable Schema Objects.
    responses?: Record<string, ResponseObject | ReferenceObject>	// An object to hold reusable Response Objects.
    parameters?: Record<string, ParameterObject | ReferenceObject>	// An object to hold reusable Parameter Objects.
    examples?: Record<string, ExampleObject | ReferenceObject>	// An object to hold reusable Example Objects.
    requestBodies?: Record<string, RequestBodyObject | ReferenceObject>	// An object to hold reusable Request Body Objects.
    headers?: Record<string, HeaderObject | ReferenceObject>	// An object to hold reusable Header Objects.
    securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>	// An object to hold reusable Security Scheme Objects.
    links?: Record<string, LinkObject | ReferenceObject>	// An object to hold reusable Link Objects.
    callbacks?: Record<string, CallbackObject | ReferenceObject>	// An object to hold reusable Callback Objects.
    pathItems?: Record<string, PathItemObject | ReferenceObject>	// An object to hold reusable Path Item Object.
}

export interface SecuritySchemeObject {
    type: string	// REQUIRED. The type of the security scheme. Valid values are "apiKey", "http", "mutualTLS", "oauth2", "openIdConnect".
    description?: string	// A description for security scheme. CommonMark syntax MAY be used for rich text representation.
    name: string		// REQUIRED. The name of the header, query or cookie parameter to be used.
    in: string	// REQUIRED. The location of the API key. Valid values are "query", "header" or "cookie".
    scheme: string	// REQUIRED. The name of the HTTP Authorization scheme to be used in the Authorization header as defined in [RFC7235]. The values used SHOULD be registered in the IANA Authentication Scheme registry.
    bearerFormat?: string	// A hint to the client to identify how the bearer token is formatted. Bearer tokens are usually generated by an authorization server, so this information is primarily for documentation purposes.
    flows: OAuthFlowsObject		// REQUIRED. An object containing configuration information for the flow types supported.
    openIdConnectUrl: string	// REQUIRED. OpenId Connect URL to discover OAuth2 configuration values. This MUST be in the form of a URL. The OpenID Connect standard requires the use of TLS.
}

export interface OAuthFlowsObject {
    implicit?: OAuthFlowObject	// Configuration for the OAuth Implicit flow
    password?: OAuthFlowObject	// Configuration for the OAuth Resource Owner Password flow
    clientCredentials?: OAuthFlowObject	// Configuration for the OAuth Client Credentials flow. Previously called application in OpenAPI 2.0.
    authorizationCode?: OAuthFlowObject	// Configuration for the OAuth Authorization Code flow. Previously called accessCode in OpenAPI 2.0.
}

export interface OAuthFlowObject {
    authorizationUrl: string// REQUIRED. The authorization URL to be used for this flow. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS.
    tokenUrl: string // REQUIRED. The token URL to be used for this flow. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS.
    refreshUrl?: string	// The URL to be used for obtaining refresh tokens. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS.
    scopes: Record<string, string>	// REQUIRED. The available scopes for the OAuth2 security scheme. A map between the scope name and a short description for it. The map MAY be empty.
}

export interface TagObject {
    name: string	// REQUIRED. The name of the tag.
    description?: string	// A description for the tag. CommonMark syntax MAY be used for rich text representation.
    externalDocs?: ExternalDocumentationObject	// Additional external documentation for this tag.
}
