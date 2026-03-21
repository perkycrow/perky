import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import CSGPlane, {COPLANAR, FRONT, BACK, SPANNING} from './csg_plane.js'
import CSGPolygon from './csg_polygon.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


export default doc('CSGPlane', () => {

    text(`
        A plane defined by a normal vector and distance from origin.
        Used to partition space and split polygons during CSG operations.
    `)


    section('Creation', () => {

        text('Create a plane from a normal and distance (w).')

        code('XY plane at origin', () => {
            const normal = new Vec3(0, 0, 1)
            const plane = new CSGPlane(normal, 0)
        })

        code('Offset plane', () => {
            const normal = new Vec3(0, 1, 0)
            const plane = new CSGPlane(normal, 5)
        })

    })


    section('Classification constants', () => {

        text('Exported constants classify polygon-plane relationships.')

        action('Constants', () => {
            logger.log('COPLANAR:', COPLANAR)
            logger.log('FRONT:', FRONT)
            logger.log('BACK:', BACK)
            logger.log('SPANNING:', SPANNING)
        })

    })


    section('Operations', () => {

        text('Planes can be cloned and flipped.')

        action('clone', () => {
            const plane = new CSGPlane(new Vec3(0, 0, 1), 5)
            const copy = plane.clone()
            logger.log('same normal z:', copy.normal.z === 1)
            logger.log('same w:', copy.w === 5)
        })

        action('flip', () => {
            const plane = new CSGPlane(new Vec3(0, 0, 1), 5)
            plane.flip()
            logger.log('flipped normal z:', plane.normal.z)
            logger.log('flipped w:', plane.w)
        })

    })


    section('Splitting polygons', () => {

        text('splitPolygon classifies a polygon against the plane and routes it accordingly.')

        action('Polygon in front', () => {
            const plane = new CSGPlane(new Vec3(0, 0, 1), -1)
            const polygon = createTriangle(0)
            const coplanarFront = []
            const coplanarBack = []
            const front = []
            const back = []
            plane.splitPolygon(polygon, coplanarFront, coplanarBack, front, back, 1e-5)
            logger.log('in front:', front.length === 1)
            logger.log('in back:', back.length === 0)
        })

        action('Polygon spanning', () => {
            const plane = new CSGPlane(new Vec3(0, 0, 1), 0.5)
            const polygon = createTriangle(0)
            const coplanarFront = []
            const coplanarBack = []
            const front = []
            const back = []
            plane.splitPolygon(polygon, coplanarFront, coplanarBack, front, back, 1e-5)
            logger.log('front pieces:', front.length)
            logger.log('back pieces:', back.length)
        })

    })

})


function createTriangle (z) {
    const normal = new Vec3(0, 0, 1)
    const v0 = new CSGVertex(new Vec3(0, 0, z), normal, [0, 0])
    const v1 = new CSGVertex(new Vec3(1, 0, z), normal, [1, 0])
    const v2 = new CSGVertex(new Vec3(0, 1, z + 1), normal, [0, 1])
    return new CSGPolygon([v0, v1, v2])
}
