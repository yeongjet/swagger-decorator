import _ from 'lodash'
import { Enum, Type } from './storage'
import { primitiveClass, PrimitiveClass } from './common/type-fest'

export const wrapArray = (type: Type, isArray: boolean, array?: any[]) => {
    const items = array ? { type, enum: array } : { type }
    return isArray ? { type: 'array', items } : items
}

export function enumToArray(enums: Enum): { itemType: Number | String; items: number[] | string[] } {
    const items = _.uniq(_.isArray(enums) ? _.reject(enums, _.isNil) : _.keys(enums).filter(n => _.isNaN(parseInt(n)))) as any
    const itemType = { number: Number, string: String }[typeof items.at(0)] || String
    return { itemType, items }
}

export function getSchemaPath(component: string | Function): string {
    const componentName = _.isString(component) ? component : component && component.name
    return `#/components/schemas/${componentName}`
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

export const isPrimitiveType = (type?: Type): type is PrimitiveClass => _.isFunction(type) && primitiveClass.some(n => n === type)

export const negate = (value: boolean) => !value

export const guard = (condition: boolean, message: string) => {
    if (!condition) {
        throw new Error(message)
    }
}

export const warning = (content: string) => {
    console.log(`warning: ${content}`)
}

export const set = (obj: any, path: string, item: any) => {
    const exist = _.get(obj, path)
    if (_.isArray(exist)) {
        exist.push(...item)
    } else {
        _.set(obj, path, item)
    }
}

export const remove = (obj: any, key) => {
    const result = obj[key]
    delete obj[key]
    return result
}

export const wrapBrace = (url: string) => {
    return url.indexOf('/:') === 0 ? `/{${url.slice(2)}}` : url
}
