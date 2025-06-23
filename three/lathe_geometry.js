import {LatheGeometry as OriginalLatheGeometry, Vector2} from 'three'


export default class LatheGeometry extends OriginalLatheGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null && !Array.isArray(params)) {
            let {points, segments, phiStart, phiLength} = params

            if (!points) {
                // Default diamond shape from Three.js documentation
                points = [
                    new Vector2(0, -0.5),
                    new Vector2(0.5, 0),
                    new Vector2(0, 0.5)
                ]
            }

            segments = segments ?? 12
            phiStart = phiStart ?? 0
            phiLength = phiLength ?? Math.PI * 2

            super(points, segments, phiStart, phiLength)
        } else if (params === null || params === undefined) {
            // Default diamond shape
            const defaultPoints = [
                new Vector2(0, -0.5),
                new Vector2(0.5, 0),
                new Vector2(0, 0.5)
            ]
            super(defaultPoints, 12, 0, Math.PI * 2)
        } else {
            super(...arguments)
        }
    }

} 