import {EdgesGeometry as OriginalEdgesGeometry} from 'three'


export default class EdgesGeometry extends OriginalEdgesGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null && !params.isBufferGeometry) {
            let {geometry, thresholdAngle, threshold} = params

            if (!geometry) {
                throw new Error('EdgesGeometry requires a geometry parameter')
            }

            if (threshold !== undefined) {
                thresholdAngle = thresholdAngle ?? threshold
            }

            thresholdAngle = thresholdAngle ?? 1

            super(geometry, thresholdAngle)
        } else if (params === null || params === undefined) {
            throw new Error('EdgesGeometry requires a geometry parameter')
        } else {
            super(...arguments)
        }
    }

} 