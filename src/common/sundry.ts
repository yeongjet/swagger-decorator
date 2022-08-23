export type PropertyKey = string | symbol

export enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
    OPTIONS,
    HEAD
}

export enum ParamType {
    BODY = 'body',
    QUERY = 'query',
    PATH = 'path',
    HEADERS = 'header'
}

