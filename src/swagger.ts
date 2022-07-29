import _ from 'lodash'
import { OpenAPI, ServerVariable, SecurityScheme, ExternalDocumentation, SecurityRequirement } from './open-api/open-api-spec.interface.js'
import { Scanner } from './scanner.js'

const defaultDocument: Omit<OpenAPI, 'paths'> = {
    openapi: '3.0.0',
    info: {
        title: '',
        description: '',
        version: '1.0.0',
        contact: {}
    },
    tags: [],
    servers: [],
    components: {}
}

interface Option {
    controllers: any[]
}

export class Swagger {
    private document: Omit<OpenAPI, 'paths'> = defaultDocument
    private scanner: Scanner
    private controllers: any
    constructor(option: Option) {
        this.scanner = new Scanner()
        this.controllers = option.controllers
    }

    setInfo(info?: OpenAPI['info']) {
        this.document.info = { ...this.document.info, ...info }
        return this
    }

    setExternalDoc(description: string, url: string): this {
        this.document.externalDocs = { description, url }
        return this
    }

    addServer(url: string, description?: string, variables?: Record<string, ServerVariable>): this {
        this.document.servers!.push({ url, description, variables })
        return this
    }

    addTag(name: string, description = '', externalDocs?: ExternalDocumentation): this {
        this.document.tags = this.document.tags!.concat({
            name,
            ..._.omitBy({ description, externalDocs }, _.isUndefined)
        })
        return this
    }

    addSecurity(name: string, options: SecurityScheme): this {
        this.document.components!.securitySchemes = {
            ...(this.document.components!.securitySchemes || {}),
            [name]: options
        }
        return this
    }

    addSecurityRequirements(name: string | SecurityRequirement, requirements: string[] = []): this {
        let securityRequirement: SecurityRequirement
        if (_.isString(name)) {
            securityRequirement = { [name]: requirements }
        } else {
            securityRequirement = name
        }
        this.document.security = (this.document.security || []).concat({ ...securityRequirement })
        return this
    }

    addBearerAuth(options: SecurityScheme = { type: 'http' }, name = 'bearer'): this {
        this.addSecurity(name, { scheme: 'bearer', bearerFormat: 'JWT', ...options })
        return this
    }

    addOAuth2(options: SecurityScheme = { type: 'oauth2' }, name = 'oauth2'): this {
        this.addSecurity(name, { flows: {}, ...options })
        return this
    }

    addApiKey(options: SecurityScheme = { type: 'apiKey' }, name = 'api_key'): this {
        this.addSecurity(name, { in: 'header', name, ...options })
        return this
    }

    addBasicAuth(options: SecurityScheme = { type: 'http' }, name = 'basic'): this {
        this.addSecurity(name, { scheme: 'basic', ...options })
        return this
    }

    addCookieAuth(cookieName = 'connect.sid', options: SecurityScheme = { type: 'apiKey' }, securityName = 'cookie'): this {
        this.addSecurity(securityName, { in: 'cookie', name: cookieName, ...options })
        return this
    }

    createDocument() {
        this.scanner.scan(this.controllers)
    }
}