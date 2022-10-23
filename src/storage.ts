import { Class } from './common/type-fest'

export type Type = Class

export type Enum = number[] | string[] | Record<number, string>

// export const storage: OpenAPI = {
//     openapi: '3.1.0',
//     info: {
//         title: '',
//         version: ''
//     }
// }

export const storage: any = {}