import {BoxGeometry as OriginalBoxGeometry} from 'three'


export default class BoxGeometry extends OriginalBoxGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {width, height, depth, widthSegments, heightSegments, depthSegments, size} = params

            if (size !== undefined) {
                width = width ?? size
                height = height ?? size
                depth = depth ?? size
            }

            width = width ?? 1
            height = height ?? 1
            depth = depth ?? 1
            widthSegments = widthSegments ?? 1
            heightSegments = heightSegments ?? 1
            depthSegments = depthSegments ?? 1

            super(width, height, depth, widthSegments, heightSegments, depthSegments)
        } else if (params === null || params === undefined) {
            super(1, 1, 1)
        } else {
            super(...arguments)
        }
    }

} 