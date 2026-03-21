import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import CSGPolygon from './csg_polygon.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


export default doc('CSGPolygon', () => {

    text(`
        A convex polygon with vertices and a splitting plane.
        Building block for CSG operations.
    `)


    section('Creation', () => {

        text('Create a polygon from vertices. Plane is computed automatically.')

        code('Triangle', () => {
            const v0 = new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 0, 1), [0, 0])
            const v1 = new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 0, 1), [1, 0])
            const v2 = new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 0, 1), [0, 1])
            const polygon = new CSGPolygon([v0, v1, v2])
        })

        code('Quad', () => {
            const v0 = new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 0, 1), [0, 0])
            const v1 = new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 0, 1), [1, 0])
            const v2 = new CSGVertex(new Vec3(1, 1, 0), new Vec3(0, 0, 1), [1, 1])
            const v3 = new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 0, 1), [0, 1])
            const polygon = new CSGPolygon([v0, v1, v2, v3])
        })

    })


    section('Plane', () => {

        text('Each polygon has a plane derived from its vertices.')

        action('Inspect plane', () => {
            const v0 = new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 0, 1), [0, 0])
            const v1 = new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 0, 1), [1, 0])
            const v2 = new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 0, 1), [0, 1])
            const polygon = new CSGPolygon([v0, v1, v2])
            logger.log('normal:', polygon.plane.normal.x, polygon.plane.normal.y, polygon.plane.normal.z)
            logger.log('w:', polygon.plane.w)
        })

    })


    section('Operations', () => {

        text('Polygons can be cloned and flipped.')

        action('clone', () => {
            const v0 = new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 0, 1), [0, 0])
            const v1 = new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 0, 1), [1, 0])
            const v2 = new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 0, 1), [0, 1])
            const polygon = new CSGPolygon([v0, v1, v2])
            const copy = polygon.clone()
            logger.log('same vertex count:', polygon.vertices.length === copy.vertices.length)
        })

        action('flip', () => {
            const v0 = new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 0, 1), [0, 0])
            const v1 = new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 0, 1), [1, 0])
            const v2 = new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 0, 1), [0, 1])
            const polygon = new CSGPolygon([v0, v1, v2])
            const normalBefore = polygon.plane.normal.z
            polygon.flip()
            logger.log('normal flipped:', polygon.plane.normal.z === -normalBefore)
            logger.log('vertices reversed:', polygon.vertices[0].position.x === 0 && polygon.vertices[0].position.y === 1)
        })

    })

})
