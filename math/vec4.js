import {Vector4} from 'three'


export default class Vec4 extends Vector4 {

    constructor (params, ...args) {
        if (typeof params === 'object') {
            super(params.x, params.y, params.z, params.w)
        } else {
            super(params, ...args)
        }
    }

}
