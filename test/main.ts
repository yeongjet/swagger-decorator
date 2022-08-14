import { buildDocument, HttpMethod } from '../src'
import { CatsController } from './cats'
import { storage } from 'routing-decorator'

console.log(CatsController)
;(async () => {
    const aaaaa = buildDocument({
        getPrefix: (controllerName) => storage.getController(controllerName).prefix,
        getRoute: (controllerName, routeName) => {
            const route = storage.getRoute(controllerName, routeName)
            return { method: HttpMethod[route.requestMethod], url: route.url }
        }
    })
    console.log(aaaaa)
})()
