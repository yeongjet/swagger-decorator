import _ from 'lodash'
import { Enum, Type, Some } from './interface'

export const set = (obj: any, path: string, item: any) => {
    const value = _.get(obj, path)
    if (_.isArray(value)) {
        value.push(...item)
    } else {
        _.set(obj, path, item)
    }
}

export const remove = <T extends Object, K extends keyof T>(obj: T | undefined, key: K): T[K] | undefined => {
    if (!obj) {
        return
    }
    const result = obj[key]
    delete obj[key]
    return result
}

export const extractType = <T>(receivedType: Some<T>) => _.flatten([receivedType]).at(0)

export function extractEnum(enums: Enum): { itemType: 'number' | 'string'; items: number[] | string[] } {
    const items = _.uniq(
        _.isArray(enums) ? _.reject(enums, _.isNil) : _.keys(enums).filter(n => _.isNaN(parseInt(n)))
    ) as number[] | string[]
    const itemType = typeof items.at(0) as 'number' | 'string'
    return { itemType, items }
}

export function getSchemaPath(component: string | Function): string {
    const componentName = _.isString(component) ? component : component && component.name
    return `#/components/schemas/${componentName}`
}

export const wrapBrace = (url: string) => {
    return url.indexOf('/:') === 0 ? `/{${url.slice(2)}}` : url
}

export const guard = (condition: boolean, message: string) => {
    if (!condition) {
        throw new Error(message)
    }
}

export const warning = (content: string) => {
    console.log(`warning: ${content}`)
}
