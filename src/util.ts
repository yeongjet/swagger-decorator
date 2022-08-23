import _ from 'lodash'
import { Enum, Type } from './common'

export const wrapArray = (type: Type, isArray: boolean, array?: any[]) => {
    const items = array ? { type, enum: array } : { type }
    return isArray ? { type: 'array', items } : items
}

export function enumToArray(enums: Enum): number[] | string[] {
    return _.uniq(_.isArray(enums) ? _.reject(enums, _.isNil) : _.keys(enums).filter(n => _.isNaN(parseInt(n)))) as any
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

export const negate = (value: boolean) => !value

export const guard = (condition: boolean, message: string) => {
    if (!condition) {
        throw new Error(message)
    }
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

export interface SetOption {
    isConcat: boolean
}

const defaultSetOption: SetOption = {
    isConcat: false
}

export const set = (target: any, keys: (string | Record<string, any>)[], values: any[], option?: SetOption) => {
    const { isConcat } = { ...defaultSetOption, ...option }
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        let parent: any
        let parentKey
        guard(_.isString(key) || _.isObject(key), `the key:${key}(${typeof key}) of ${target}(${typeof target}) is invalid`)
        if (_.isString(key)) {
            parentKey = key
            if (_.isUndefined(target[key]) && values[i]) {
                target[key] = values[i]
            }
            parent = target
            target = target[key]
        } else if (_.isObject(key)) {
            const subKey = Object.keys(key).at(0) as string
            guard(
                _.isString(subKey) && _.isObject(key[subKey]),
                `the key:${JSON.stringify(key)} of ${target}(${typeof target}) is invalid`
            )
            target = target[subKey]
            guard(_.isArray(target), `the target:${target} must be array`)
            let item = target.find(n => isContain(n, key[subKey]))
            if (_.isUndefined(item) && values[i]) {
                item = values[i]
                target.push(item)
            }
            parent = target
            target = item
        }
        guard(negate(_.isUndefined(target)), 'target is not found')
        if (i === keys.length - 1) {
            if (_.isArray(target)) {
                if (isConcat) {
                    target.push(...values[i])
                } else {
                    target.push(values[i])
                }
            } else if (_.isObject(target)) {
                Object.assign(target, values[i + 1])
            } else if(isValidKey(parentKey)) {
                parent[parentKey] = values[i]
            }
        }
    }
}