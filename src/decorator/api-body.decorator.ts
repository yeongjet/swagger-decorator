import _ from 'lodash'
import { Class, MergeExclusive } from 'type-fest'
import { Enum, RequestBody, Schema } from '../common/open-api'
import { enumToArray } from '../util'

export type ApiBodyOption = Omit<RequestBody, 'content'> & { isArray?: boolean } & MergeExclusive<{ type: Class<any> }, MergeExclusive<{ enum: Enum }, { schema: Schema }>>

const defaultOption: Partial<ApiBodyOption> = {
    isArray: false,
    required: true
}

export function ApiBody(option: ApiBodyOption): MethodDecorator {
    const body = { ...defaultOption, ..._.omit(option, 'isArray', 'enum', 'schema') }
    if (option.type) {
        body.type = option.type
    } else if (option.enum) {
        const array = enumToArray(option.enum)
        const type = typeof array[0]
        if (option.isArray) {
            
            body.schema = {
                type: 'array',
                items: {
                    type,
                    enum: array
                }
            }
        } else {
            body.schema = {
                type,
                enum: array
            }
        }
    }
}
