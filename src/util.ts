import _ from 'lodash'
import { Enum, Type, Schema } from './storage'
import { primitiveClass, PrimitiveClass } from './common/type-fest'

export const wrapArray = (type: Type, isArray: boolean, array?: any[]): Schema => {
    const items = array ? { type, enum: array } : { type }
    return isArray ? { type: 'array', items } : items
}

export function enumToArray(enums: Enum): { itemType: Number | String, items: number[] | string[] } {
    const items = _.uniq(_.isArray(enums) ? _.reject(enums, _.isNil) : _.keys(enums).filter(n => _.isNaN(parseInt(n)))) as any
    const itemType = { number: Number, string: String }[typeof items.at(0)] || String
    return { itemType, items }
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

//export const isNotPrimitiveType = (type: Type): type is TypeFest.Class<any> => !(_.isFunction(type) && primitiveClass.some(n => n === type))

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

export const merge = (n: object, v: object, arrayMergeKeys: string[]) => {
    let arrayStack = 0
    _.mergeWith(n, v, (c, r, stack) => {
        if(!_.isArray(c)) {
            return
        }
        let mergeKey = arrayMergeKeys[arrayStack]
        arrayStack++
        const t = _.find(c, { [mergeKey]: r.at(0)[mergeKey] })
        if (t) {
            return
        }
        return c.concat(r);
    })
}

export const wrapBraceIfParam = (param: string) => {
    return param.indexOf('/:') === 0 ? `/{${param.slice(2)}}` : param
}
