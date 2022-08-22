import { ApiProperty, ApiPropertyOption } from './api-property.decorator'

export function ApiPropertyOptional(option: ApiPropertyOption) {
  return ApiProperty({ ...option, required: false })
}
