import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import filterDegeneratePolygons from './csg_utils.js'
import CSG from './csg.js'
import {createBoxGeometry} from '../geometry_primitives.js'


export default doc('CSG Utils', {advanced: true}, () => {

    text(`
        Utility functions for CSG polygon processing. Currently provides
        filtering of degenerate polygons after boolean operations.
    `)


    section('filterDegeneratePolygons', () => {

        text(`
            Removes polygons that are too small to be meaningful. A polygon is
            considered degenerate if it has fewer than 3 vertices or if its
            area squared is smaller than \`epsilon * epsilon\`.

            Used internally by [[CSG@render/csg]] after boolean operations to
            clean up near-zero-area triangles created at intersection edges.
        `)

        code('Usage', () => {
            const polygons = []
            const epsilon = 0.0001
            const filtered = filterDegeneratePolygons(polygons, epsilon)
        })

        action('Filter in action', () => {
            const csg = CSG.fromGeometry(createBoxGeometry())
            const polygons = csg.polygons
            const before = polygons.length
            const filtered = filterDegeneratePolygons(polygons, 0.0001)
            const after = filtered.length
            logger.log('before:', before)
            logger.log('after:', after)
        })

    })

})
