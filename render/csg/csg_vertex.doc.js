import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


export default doc('CSGVertex', {advanced: true}, () => {

    text(`
        Represents a single vertex in the CSG system. Stores position, normal,
        UV coordinates, and vertex color. Used internally by [[CSGPolygon@render/csg]]
        to define polygon geometry.
    `)


    section('Creation', () => {

        text('Create a vertex with position, normal, UV, and optional color.')

        code('Basic vertex', () => {
            const vertex = new CSGVertex(
                new Vec3(1, 0, 0),
                new Vec3(0, 1, 0),
                [0.5, 0.5]
            )
        })

        code('With color', () => {
            const vertex = new CSGVertex(
                [1, 0, 0],
                [0, 1, 0],
                [0.5, 0.5],
                [1, 0, 0]
            )
        })

    })


    section('clone', () => {

        text('Returns a deep copy of the vertex with all properties cloned.')

        action('Clone a vertex', () => {
            const original = new CSGVertex(
                new Vec3(1, 2, 3),
                new Vec3(0, 1, 0),
                [0.5, 0.5]
            )
            const copy = original.clone()
            copy.position.x = 10
            logger.log('original x:', original.position.x)
            logger.log('copy x:', copy.position.x)
        })

    })


    section('interpolate', () => {

        text(`
            Creates a new vertex by linearly interpolating between this vertex
            and another. Position, UV, and color are lerped; the normal is
            lerped and renormalized.
        `)

        action('Interpolate vertices', () => {
            const a = new CSGVertex(
                new Vec3(0, 0, 0),
                new Vec3(0, 1, 0),
                [0, 0]
            )
            const b = new CSGVertex(
                new Vec3(10, 0, 0),
                new Vec3(0, 1, 0),
                [1, 1]
            )
            const mid = a.interpolate(b, 0.5)
            logger.log('position:', mid.position.x, mid.position.y, mid.position.z)
            logger.log('uv:', mid.uv[0], mid.uv[1])
        })

    })

})
