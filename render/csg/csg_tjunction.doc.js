import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import suppressTJunctions from './csg_tjunction.js'
import CSG from './csg.js'
import {createBoxGeometry, createSphereGeometry} from '../geometry_primitives.js'


export default doc('CSG T-Junction', {advanced: true}, () => {

    text(`
        T-junction suppression for CSG polygon sets. Fixes rendering
        artifacts caused by vertices lying on edges of adjacent polygons.
    `)


    section('The Problem', () => {

        text(`
            When two polygons share an edge but one has an extra vertex
            along that edge (a T-junction), rasterization can produce
            visible cracks due to floating-point precision.

            This happens frequently after CSG operations when geometry
            is split along intersection curves.
        `)

    })


    section('suppressTJunctions', () => {

        text(`
            Scans all polygon edges and inserts interpolated vertices
            where other vertices lie on the edge. This ensures adjacent
            polygons share the same vertices along their common edges.
        `)

        code('Usage', () => {
            const polygons = []
            const epsilon = 0.0001
            const fixed = suppressTJunctions(polygons, epsilon)
        })

        action('Fix T-junctions', () => {
            const box = CSG.fromGeometry(createBoxGeometry())
            const sphere = CSG.fromGeometry(createSphereGeometry({radius: 0.7}))
            const result = box.subtract(sphere)

            const before = result.polygons.length
            const fixed = suppressTJunctions(result.polygons, 0.0001)
            const after = fixed.length

            logger.log('polygons before:', before)
            logger.log('polygons after:', after)
        })

    })


    section('Parameters', () => {

        text(`
            The epsilon value controls the tolerance for detecting
            vertices on edges. Smaller values are more precise but may
            miss vertices due to floating-point error. Typical values
            range from 0.0001 to 0.001.
        `)

        code('Tight tolerance', () => {
            const fixed = suppressTJunctions(polygons, 0.0001)
        })

        code('Loose tolerance', () => {
            const fixed = suppressTJunctions(polygons, 0.001)
        })

    })

})
