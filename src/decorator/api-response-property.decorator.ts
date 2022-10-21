import { ApiProperty, ApiPropertyOption } from './api-property.decorator'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'

export function ApiResponseProperty(
    option: Pick<ApiPropertyOption, 'type' | 'example' | 'enum' | 'deprecated'> = {}
): PropertyDecorator {
    return ApiProperty(option)
}
