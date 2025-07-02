import {TubeGeometry as OriginalTubeGeometry, QuadraticBezierCurve3, Vector3} from 'three'


export default class TubeGeometry extends OriginalTubeGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null && !params.type) {
            let {path, tubularSegments, radius, radialSegments, closed, size, segments} = params

            if (!path) {
                path = new QuadraticBezierCurve3(
                    new Vector3(-1, 0, 0),
                    new Vector3(0, 1, 0),
                    new Vector3(1, 0, 0)
                )
            }

            if (size !== undefined) {
                radius = radius ?? size
            }

            if (segments !== undefined) {
                tubularSegments = tubularSegments ?? segments
                radialSegments = radialSegments ?? Math.max(Math.floor(segments / 8), 3)
            }

            tubularSegments = tubularSegments ?? 64
            radius = radius ?? 1
            radialSegments = radialSegments ?? 8
            closed = closed ?? false

            super(path, tubularSegments, radius, radialSegments, closed)
        } else if (params === null || params === undefined) {
            super()
        } else {
            super(...arguments)
        }
    }

} 