import {TetrahedronGeometry as OriginalTetrahedronGeometry} from 'three'


export default class TetrahedronGeometry extends OriginalTetrahedronGeometry {

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
            super()
        } else {
            super(...arguments)
        }
    }

} 