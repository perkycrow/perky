import {SphereGeometry as OriginalSphereGeometry} from 'three'


export default class SphereGeometry extends OriginalSphereGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength, size, segments} = params

            if (size !== undefined) {
                radius = radius ?? size
            }

            if (segments !== undefined) {
                widthSegments = widthSegments ?? segments
                heightSegments = heightSegments ?? segments
            }

            radius = radius ?? 1
            widthSegments = widthSegments ?? 32
            heightSegments = heightSegments ?? 16
            phiStart = phiStart ?? 0
            phiLength = phiLength ?? Math.PI * 2
            thetaStart = thetaStart ?? 0
            thetaLength = thetaLength ?? Math.PI

            super(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
        } else if (params === null || params === undefined) {
            super()
        } else {
            super(...arguments)
        }
    }

} 