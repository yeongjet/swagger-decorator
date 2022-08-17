export type Property = string | symbol

export enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
    OPTIONS,
    HEAD
}

export enum ParamSource {
    BODY = 'body',
    QUERY = 'query',
    PARAM = 'param',
    HEADERS = 'header'
}

