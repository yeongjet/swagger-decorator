export type PropertyKey = string | symbol

export type ClassDecoratorParams = [
    target: Function
]

export type MethodDecoratorParams = [
    target: Object,
    property: PropertyKey,
    descriptor: PropertyDescriptor
]

export type PropertyDecoratorParams = [
    target: Object,
    property: PropertyKey
]

export type ParameterDecoratorParams = [
    target: Object,
    property: PropertyKey,
    parameterIndex: number
]
