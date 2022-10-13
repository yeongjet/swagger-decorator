import _ from 'lodash'
import { Enum, Type, Schema } from './common'
import { primitiveClass, PrimitiveClass } from './common/type-fest'
import TypeFest from 'type-fest'

export const wrapArray = (type: Type, isArray: boolean, array?: any[]): Schema => {
    const items = array ? { type, enum: array } : { type }
    return isArray ? { type: 'array', items } : items
}

export function enumToArray(enums: Enum): { itemType: Number | String, array: number[] | string[] } {
    const array = _.uniq(_.isArray(enums) ? _.reject(enums, _.isNil) : _.keys(enums).filter(n => _.isNaN(parseInt(n)))) as any
    const itemType = { number: Number, string: String }[typeof array.at(0)] || String
    return { itemType, array }
}

export function getSchemaPath(model: string | Function): string {
    const modelName = _.isString(model) ? model : model && model.name
    return `#/components/schemas/${modelName}`
}

export const isContain = (first: object, second: object) => {
    for (const key of Object.keys(second)) {
        if (first[key] !== second[key]) {
            return false
        }
    }
    return true
}

export const isValidKey = (name?: string) => _.isString(name) && name.length > 0

export const isCustomType = (type: Type): type is TypeFest.Class<any> => !(_.isFunction(type) && primitiveClass.some(n => n === type))

export const isPrimitiveType = (type: Type): type is PrimitiveClass => _.isFunction(type) && primitiveClass.some(n => n === type)

export const negate = (value: boolean) => !value

export const guard = (condition: boolean, message: string) => {
    if (!condition) {
        throw new Error(message)
    }
}

export const warning = (content: string) => {
    console.log(`warning: ${content}`)
}

// merge({ a: [{ b: 2 }] }, { a: [{ c: 3 }] } => { a: [{ b: 2 }, { c: 3 }] }
export const merge = (first: object, second: object) => {
    const result = {}
    _.map(first, (value, key) => {
        if (_.isArray(value) && _.isArray(second[key])) {
            result[key] = [ ...value as any[], ...second[key] ]
        } else if (_.isObject(value) && _.isObject(second[key])){
            result[key] = { ...value as object, ...second[key] }
        } else {
            result[key] = value
        }
    })
    return result
}

export const wrapBraceIfParam = (param: string) => {
    return param.indexOf('/:') === 0 ? `/{${param.slice(2)}}` : param
}

// export const setWithDefault = (target: Record<string, any>, defaultValue: any, paths: [string, ...(Record<string, any> | string)[]], value: any, option?: SetOption) => {
//     const { isConcat } = { ...defaultOption, ...option }
//     let firstKey = paths.shift() as string
//     guard(_.isString(firstKey) && firstKey.length > 0, `the key "${firstKey}(${typeof firstKey})" must be non-empty string`)
//     target[firstKey] = target[firstKey] || defaultValue
//     target = target[firstKey]
//     let previousTarget
//     let lastPath = paths.at(-1) as string
//     for (const path of paths) {
//         previousTarget = target
//         if (_.isString(path)) {
//             console.log(target)
//             target = target[path]
//         } else if (_.isObject(path)) {
//             guard(_.isArray(target), `the target:${JSON.stringify(target)} must be array when key is object`)
//             target = target.find(n => isContain(n, path))
//         }
//     }
//     if (_.isArray(target)) {
//         if (isConcat) {
//             target.push(...value)
//         } else {
//             target.push(value)
//         }
//     } else if (_.isObject(target)) {
//         Object.assign(target, value)
//     } else {
//         console.log(target)
//         previousTarget[lastPath] = value
//     }
// }