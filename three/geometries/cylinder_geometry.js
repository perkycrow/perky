import {CylinderGeometry as OriginalCylinderGeometry} from 'three'


export default class CylinderGeometry extends OriginalCylinderGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength, size, radius} = params

            if (size !== undefined) {
                if (radiusTop === undefined && radius === undefined) {
                    radiusTop = size
                }
                if (radiusBottom === undefined && radius === undefined) {
                    radiusBottom = size
                }
                height = height ?? size * 2
            }

            if (radius !== undefined) {
                radiusTop = radiusTop ?? radius
                radiusBottom = radiusBottom ?? radius
            }

            radiusTop = radiusTop ?? 1
            radiusBottom = radiusBottom ?? 1
            height = height ?? 1
            radialSegments = radialSegments ?? 32
            heightSegments = heightSegments ?? 1
            openEnded = openEnded ?? false
            thetaStart = thetaStart ?? 0
            thetaLength = thetaLength ?? Math.PI * 2

            super(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength)
        } else if (params === null || params === undefined) {
            super(1, 1, 1)
        } else {
            super(...arguments)
        }
    }

} 