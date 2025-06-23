import {DodecahedronGeometry as OriginalDodecahedronGeometry} from 'three'


export default class DodecahedronGeometry extends OriginalDodecahedronGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {radius, detail, size} = params

            if (size !== undefined) {
                radius = radius ?? size
            }

            radius = radius ?? 1
            detail = detail ?? 0

            super(radius, detail)
        } else if (params === null || params === undefined) {
            super(1, 0)
        } else {
            super(...arguments)
        }
    }

} 