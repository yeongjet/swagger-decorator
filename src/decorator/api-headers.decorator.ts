import { ApiHeader, ApiHeaderOption } from './api-header.decorator'
import { ClassDecoratorParams, MethodDecoratorParams } from '../util'

export const ApiHeaders = (...headers: ApiHeaderOption[]) => {
    return (...params: ClassDecoratorParams | MethodDecoratorParams): any => {
        // @ts-ignore
        headers.forEach(header => ApiHeader(header)(...params))
    }
}
