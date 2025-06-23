import {CircleGeometry as OriginalCircleGeometry} from 'three'


export default class CircleGeometry extends OriginalCircleGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {radius, segments, thetaStart, thetaLength, size} = params

            if (size !== undefined) {
                radius = radius ?? size
            }

            radius = radius ?? 1
            segments = segments ?? 32
            thetaStart = thetaStart ?? 0
            thetaLength = thetaLength ?? Math.PI * 2

            super(radius, segments, thetaStart, thetaLength)
        } else if (params === null || params === undefined) {
            super(1, 32)
        } else {
            super(...arguments)
        }
    }

} 