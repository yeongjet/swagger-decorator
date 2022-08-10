import _ from 'lodash'
import { Enum, Property, Type } from './common'

export const wrapArray = (type: Type, isArray: boolean, array?: any[]) => {
    const items = array ? { type, enum: array } : { type }
    return isArray ? { type: 'array', items } : items
}

export function enumToArray(enums: Enum): number[] | string[] {
    return _.uniq(_.isArray(enums) ? _.reject(enums, _.isNil) : _.keys(enums).filter(_.isNaN)) as any
}

export function getSchemaPath(model: string | Function): string {
    const modelName = _.isString(model) ? model : model && model.name
    return `#/components/schemas/${modelName}`
}

export type ClassDecoratorParams = [
    target: Function
]

export type MethodDecoratorParams = [
    target: Object,
    property: Property,
    descriptor: PropertyDescriptor
]

export type PropertyDecoratorParams = [
    target: Object,
    property: Property
]

export type ParameterDecoratorParams = [
    target: Object,
    property: Property,
    parameterIndex: number
]

type DecoratorParams = ClassDecoratorParams | PropertyDecoratorParams | MethodDecoratorParams | ParameterDecoratorParams

export const isClassDecoration = (params: DecoratorParams): params is ClassDecoratorParams => {
    const [ target, property, descriptor ] = params
    return !_.isUndefined(target) && _.isUndefined(property) && _.isUndefined(descriptor)
}

export const isPropertyDecoration = (params: DecoratorParams): params is PropertyDecoratorParams => {
    const [ target, property, descriptor ] = params
    return !_.isUndefined(target) && !_.isUndefined(property) && _.isUndefined(descriptor)
}

export const isMethodDecoration = (params: DecoratorParams): params is MethodDecoratorParams => {
    const [ target, property, descriptor ] = params
    return !_.isUndefined(target) && !_.isUndefined(property) && _.isObject(descriptor)
}

export const isParameterDecoration = (params: DecoratorParams): params is ParameterDecoratorParams => {
    const [ target, property, parameterIndex ] = params
    return !_.isUndefined(target) && !_.isUndefined(property) && _.isNumber(parameterIndex)
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

export const throwError = (message: string) => {
    throw new Error(message)
}

interface SetOption {
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
            const subKey = Object.keys(key)[0]
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