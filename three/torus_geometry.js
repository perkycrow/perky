import {TorusGeometry as OriginalTorusGeometry} from 'three'


export default class TorusGeometry extends OriginalTorusGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {radius, tube, radialSegments, tubularSegments, arc, size, segments} = params

            if (size !== undefined) {
                radius = radius ?? size
                tube = tube ?? size * 0.4
            }

            if (segments !== undefined) {
                radialSegments = radialSegments ?? segments
                tubularSegments = tubularSegments ?? segments
            }

            radius = radius ?? 1
            tube = tube ?? 0.4
            radialSegments = radialSegments ?? 12
            tubularSegments = tubularSegments ?? 48
            arc = arc ?? Math.PI * 2

            super(radius, tube, radialSegments, tubularSegments, arc)
        } else if (params === null || params === undefined) {
            super()
        } else {
            super(...arguments)
        }
    }

} 