import { Content } from './open-api/open-api-spec.interface.js'

export class MimetypeContentWrapper {
    wrap(mimetype: string[], obj: Record<string, any>): Record<'content', Content> {
        const content = mimetype.reduce((acc, item) => ({ ...acc, [item]: obj }), {})
        return { content }
    }
}
