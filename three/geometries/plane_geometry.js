import {PlaneGeometry as OriginalPlaneGeometry} from 'three'


export default class PlaneGeometry extends OriginalPlaneGeometry {

    constructor (params) { // eslint-disable-line complexity
        if (typeof params === 'object' && params !== null) {
            let {width, height, widthSegments, heightSegments, size, segments} = params

            if (size !== undefined) {
                width = width ?? size
                height = height ?? size
            }

            if (segments !== undefined) {
                widthSegments = widthSegments ?? segments
                heightSegments = heightSegments ?? segments
            }

            width = width ?? 1
            height = height ?? 1
            widthSegments = widthSegments ?? 1
            heightSegments = heightSegments ?? 1

            super(width, height, widthSegments, heightSegments)
        } else if (params === null || params === undefined) {
            super(1, 1, 1, 1)
        } else {
            super(...arguments)
        }
    }

} 