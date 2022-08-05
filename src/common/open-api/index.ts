import { Schema, ParameterLocation } from './open-api-spec.interface'
import type { MergeExclusive } from 'type-fest'

export * from './open-api-spec.interface'

export type Enum = MergeExclusive<string[] | number[], Record<string, number>>

export interface Type<T = any> extends Function {
    new (...args: any[]): T
}

export interface SchemaMetadata extends Omit<Schema, 'type' | 'required'> {
    type?: Type<unknown> | Type<unknown>[] | string | Record<string, any>
    required?: boolean
}

const PARAM_TOKEN_PLACEHOLDER = 'placeholder'

export interface ParamWithTypeMetadata {
    name?: string | number | object;
    type?: Type<unknown>;
    in?: ParameterLocation | 'body' | typeof PARAM_TOKEN_PLACEHOLDER;
    isArray?: boolean;
    required: true;
    enum?: unknown[];
    enumName?: string;
}