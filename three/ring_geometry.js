import {RingGeometry as OriginalRingGeometry} from 'three'


export default class RingGeometry extends OriginalRingGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength, size, radius, segments} = params

            if (size !== undefined) {
                outerRadius = outerRadius ?? size
                innerRadius = innerRadius ?? size / 2
            }

            if (radius !== undefined) {
                outerRadius = radius
            }

            if (segments !== undefined) {
                thetaSegments = thetaSegments ?? segments
            }

            innerRadius = innerRadius ?? 0.5
            outerRadius = outerRadius ?? 1
            thetaSegments = thetaSegments ?? 32
            phiSegments = phiSegments ?? 1
            thetaStart = thetaStart ?? 0
            thetaLength = thetaLength ?? Math.PI * 2

            super(innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength)
        } else if (params === null || params === undefined) {
            super()
        } else {
            super(...arguments)
        }
    }

} 