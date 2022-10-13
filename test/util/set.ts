import { setWithDefault } from "../../src/util"
import util from 'util'
type Total =
    Record<string, {
        b: string
        c: {
            d: number
            e: {
                f: string
            }[]
        }
    }[]>
let getDefaults = (a: string, d: number, f: string): any => ({
    [a]: [{
        b: 'sd',
        c: {
            d,
            e: [
                {
                    f,
                    k:10
                }
            ]
        }
    }]
})

let a = {
    name: 'gawe',
    age: 12
}

let b = [{
    po: 'ge'
}]

let total = {}
setWithDefault(total, getDefaults('name', 1, 'fs'), ['hd', 'name', { b:'sd' },'c', 'e', { f:'fs' }, 'k'], 12)
console.log(util.inspect(total, false, 10))