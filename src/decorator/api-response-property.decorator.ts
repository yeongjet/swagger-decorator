import { ApiProperty, ApiPropertyOption } from './api-property.decorator'

export function ApiResponseProperty(
  option: Pick<ApiPropertyOption, 'type' | 'example' | 'enum' | 'deprecated'> = {}
): PropertyDecorator {
  return ApiProperty(option)
}
