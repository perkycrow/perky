import {PolyhedronGeometry as OriginalPolyhedronGeometry} from 'three'


export default class PolyhedronGeometry extends OriginalPolyhedronGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null && !Array.isArray(params)) {
            let {vertices, indices, radius, detail, size} = params

            if (!vertices || !Array.isArray(vertices)) {
                throw new Error('PolyhedronGeometry requires a vertices array parameter')
            }

            if (!indices || !Array.isArray(indices)) {
                throw new Error('PolyhedronGeometry requires an indices array parameter')
            }

            if (size !== undefined) {
                radius = radius ?? size
            }

            radius = radius ?? 1
            detail = detail ?? 0

            super(vertices, indices, radius, detail)
        } else if (params === null || params === undefined) {
            throw new Error('PolyhedronGeometry requires vertices and indices parameters')
        } else {
            super(...arguments)
        }
    }

} 