import {CapsuleGeometry as OriginalCapsuleGeometry} from 'three'


export default class CapsuleGeometry extends OriginalCapsuleGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {radius, height, capSegments, radialSegments, heightSegments, size} = params

            if (size !== undefined) {
                radius = radius ?? size
                height = height ?? size * 2
            }

            radius = radius ?? 1
            height = height ?? 1
            capSegments = capSegments ?? 4
            radialSegments = radialSegments ?? 8
            heightSegments = heightSegments ?? 1

            super(radius, height, capSegments, radialSegments, heightSegments)
        } else if (params === null || params === undefined) {
            super(1, 1)
        } else {
            super(...arguments)
        }
    }

} 