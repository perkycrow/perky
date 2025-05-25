import {Vector2} from 'three'


export default class Vec2 extends Vector2 {

    constructor (params, ...args) {
        if (typeof params === 'object') {
            if (Array.isArray(params)) {
                super(...params)
            } else {
                super(params.x, params.y)
            }
        } else {
            super(params, ...args)
        }
    }
}
