import { buildDocument, HttpMethod, ParamSource as SwaggerParamSource } from '../src'
import { CatsController } from './cats'
import { storage, Storage, ParamSource as RoutingParamSource } from 'routing-decorator'



console.log(CatsController)

const convertParams = (params: Storage.Param[]) => {
    const typeMapping = {
        [RoutingParamSource.BODY]: SwaggerParamSource.BODY,
        [RoutingParamSource.QUERY]: SwaggerParamSource.QUERY,
        [RoutingParamSource.PARAM]: SwaggerParamSource.PARAM,
        [RoutingParamSource.HEADERS]: SwaggerParamSource.HEADERS
    }
    return params.map(n => ({ ...n, source: typeMapping[n.source] }))
}

;(async () => {
    const aaaaa = buildDocument({
        getPrefix: (controllerName) => storage.getController(controllerName).prefix,
        getRoute: (controllerName, routeName) => {
            const { requestMethod, url, params } = storage.getRoute(controllerName, routeName)
            return { method: HttpMethod[requestMethod], url, params: convertParams(params) }
        }
    })
    console.log(aaaaa)
})()
