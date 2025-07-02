import {OrthographicCamera as OriginalOrthographicCamera} from 'three'


export default class OrthographicCamera extends OriginalOrthographicCamera {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {left, right, top, bottom, near, far, width, height} = params

            if (width !== undefined && height !== undefined) {
                left   = left   ?? width / -2
                right  = right  ?? width / 2
                top    = top    ?? height / 2
                bottom = bottom ?? height / -2
            }

            near = near ?? 0.1
            far = far ?? 2000

            super(left, right, top, bottom, near, far)
        } else if (params === null || params === undefined) {
            super(-1, 1, 1, -1)
        } else {
            super(...arguments)
        }
    }

}
