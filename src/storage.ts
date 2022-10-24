import { Class } from './common/type-fest'

export type Type = Class

export type Enum = number[] | string[] | Record<number, string>

export const storage: any = {}