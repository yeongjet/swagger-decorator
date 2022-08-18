import { buildDocument, HttpMethod } from '../src'
import { CatsController } from './cats'
import { storage, Storage, ParamSource } from 'routing-decorator'
import _ from 'lodash';

console.log(CatsController)

const transformParams = (params: Storage.Param[]) => {
    const sourceMapping = {
        [ParamSource.BODY]: 'body',
        [ParamSource.QUERY]: 'query',
        [ParamSource.PARAM]: 'param',
        [ParamSource.HEADERS]: 'header'
    }
    return params.map(n => ({ ...n, source: sourceMapping[n.source] })).filter(n => _.negate(_.isNil)(n.source))
}

;(async () => {
    const aaaaa = buildDocument({
        getPrefix: (controllerName) => storage.getController(controllerName).prefix,
        getRoute: (controllerName, routeName) => {
            const { requestMethod, url, params } = storage.getRoute(controllerName, routeName)
            return { method: HttpMethod[requestMethod], url, params: transformParams(params) }
        }
    })
    console.log(aaaaa)
})()
