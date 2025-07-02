import {ConeGeometry as OriginalConeGeometry} from 'three'


export default class ConeGeometry extends OriginalConeGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength, size} = params

            if (size !== undefined) {
                radius = radius ?? size
                height = height ?? size * 2
            }

            radius = radius ?? 1
            height = height ?? 1
            radialSegments = radialSegments ?? 32
            heightSegments = heightSegments ?? 1
            openEnded = openEnded ?? false
            thetaStart = thetaStart ?? 0
            thetaLength = thetaLength ?? Math.PI * 2

            super(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength)
        } else if (params === null || params === undefined) {
            super(1, 1)
        } else {
            super(...arguments)
        }
    }

} 