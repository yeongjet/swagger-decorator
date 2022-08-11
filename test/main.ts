import { storage } from '../src'
import { CatsController } from './cats'

console.log(CatsController)
;(async () => {
    const aaaaa = storage.get()
    console.log(aaaaa)
})()
