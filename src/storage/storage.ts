import { set } from '../util'
import { Storage } from '../common'

// const openApiVersion = '3.1.0'
// {
//     openapi: openApiVersion,
//     info: {
//         title: '',
//         version: ''
//     },
//     paths:{}
// }
const storage: Storage = {
    schemas: [],
    controllers: {}
}

export const get = () => storage

export const addSchemas = (schemas: Function[]) => {
    set(storage, [ 'schemas' ], [ schemas ], { isConcat: true })
}