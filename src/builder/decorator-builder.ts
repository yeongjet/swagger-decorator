import * as storage from '../storage'
import { ClassDecoratorParams, MethodDecoratorParams } from '../util'

export const createMethodDecorator =
    (key: any, value: any, option?: any): MethodDecorator => (...[ target, property ]: MethodDecoratorParams) => {
        storage.setRoute(target.constructor.name, property, key ? [ key ]: [], [ value ], option)
    }

export const createClassMethodDecorator = (key: any, value: any, option?: any): ClassDecorator & MethodDecorator => (...[ target, property ]: ClassDecoratorParams | MethodDecoratorParams) => {
    if (property) {
        storage.setRoute((target as Object).constructor.name, property, key ? [ key ]: [], [ value ], option)
    } else {
        storage.setController((target as Function).name, key ? [ key ]: [], [ value ], option)
    }
}
