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

export enum ParamIn {
    BODY = 'body',
    QUERY = 'query',
    PATH = 'path',
    HEADERS = 'header'
}

