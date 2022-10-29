import { DecoratorParameterLocation } from './interface'
import { ApiResponseOption, ApiHeaderOption, ApiParamOption, ApiQueryOption, ApiPropertyOption } from './decorator'

export interface Component extends Record<string, ApiPropertyOption> {}

export interface Components extends Record<string, Component> {}

export type Parameter = (ApiHeaderOption | ApiQueryOption | ApiParamOption) & { in: `${DecoratorParameterLocation}` }

export interface Handler {
    parameters?: Parameter[]
    consumes?: string[]
    produces?: string[]
    responses?: ApiResponseOption[]
}

export interface Controller {
    handlers: Record<string, Handler>
    consumes?: string[]
    produces?: string[]
}

export interface Controllers extends Record<string, Controller> {}

export interface Storage {
    components?: Components
    controllers?: Controllers
}

export const storage: Storage = {}