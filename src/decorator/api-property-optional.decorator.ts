import { ApiProperty, ApiPropertyOption } from './api-property.decorator'
import { ClassDecoratorParams, MethodDecoratorParams } from '../builder'

export function ApiPropertyOptional(option: ApiPropertyOption) {
  return ApiProperty({ ...option, required: false })
}
