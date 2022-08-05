import * as util from '../util'
import * as storage from './storage'
import * as defaults from './default'
import { Controller, Header} from '../common'
import { SecurityRequirement } from '../common/open-api'

const controllers = storage.get().controllers

export const set = (name: string, value: Partial<Controller>) => {
    util.set(controllers, [ name ], [ defaults.getController(), value ])
}

export const addSecurity = (name: string, security: SecurityRequirement) => {
    util.set(controllers, [ name, 'security' ], [ defaults.getController(), security ])
}

export const addConsumes = (name: string, consumes: string[]) => {
    util.set(controllers, [ name, 'consumes' ], [ defaults.getController(), consumes ], { isConcat: true })
}

export const addHeader = (name: string, header: Header) => {
    util.set(controllers, [ name, 'headers' ], [ defaults.getController(), header ])
}