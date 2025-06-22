import {PerspectiveCamera as OriginalPerspectiveCamera} from 'three'


export default class PerspectiveCamera extends OriginalPerspectiveCamera {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {fov, aspect, near, far, width, height} = params

            if (width !== undefined && height !== undefined) {
                aspect = aspect ?? width / height
            }

            fov = fov ?? 50
            aspect = aspect ?? 1
            near = near ?? 0.1
            far = far ?? 2000

            super(fov, aspect, near, far)
        } else if (params === null || params === undefined) {
            super(50, 1)
        } else {
            super(...arguments)
        }
    }

} 