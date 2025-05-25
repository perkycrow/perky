import {Vector3} from 'three'


export default class Vec3 extends Vector3 {
    
    constructor (params, ...args) {
        if (typeof params === 'object') {
            super(params.x, params.y, params.z)
        } else {
            super(params, ...args)
        }
    }

}
