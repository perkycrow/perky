import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import CSGNode from './csg_node.js'
import CSGPolygon from './csg_polygon.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


export default doc('CSGNode', () => {

    text(`
        BSP tree node for CSG operations.
        Recursively partitions polygons into front/back sets using a splitting plane.
        Used internally by CSG for boolean operations.
    `)


    section('Creation', () => {

        text('Build a BSP tree from polygons.')

        code('From polygons', () => {
            const polygons = createTriangle()
            const node = new CSGNode(polygons, 1e-5)
        })

        code('Empty node', () => {
            const node = new CSGNode()
        })

    })


    section('Structure', () => {

        text('Each node has a splitting plane, front/back children, and coplanar polygons.')

        action('Inspect node', () => {
            const polygons = createTriangle()
            const node = new CSGNode(polygons, 1e-5)
            logger.log('has plane:', node.plane !== null)
            logger.log('polygons:', node.polygons.length)
            logger.log('front:', node.front !== null)
            logger.log('back:', node.back !== null)
        })

    })


    section('Operations', () => {

        text('Nodes support clipping and inversion for CSG algorithms.')

        action('allPolygons', () => {
            const polygons = createTriangle()
            const node = new CSGNode(polygons, 1e-5)
            const all = node.allPolygons()
            logger.log('total polygons:', all.length)
        })

        action('invert', () => {
            const polygons = createTriangle()
            const node = new CSGNode(polygons, 1e-5)
            const normalBefore = node.plane.normal.clone()
            node.invert()
            logger.log('normal flipped:', node.plane.normal.dot(normalBefore) < 0)
        })

        action('clone', () => {
            const polygons = createTriangle()
            const node = new CSGNode(polygons, 1e-5)
            const copy = node.clone()
            logger.log('same polygon count:', node.allPolygons().length === copy.allPolygons().length)
        })

    })

})


function createTriangle () {
    const v0 = new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 0, 1), [0, 0])
    const v1 = new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 0, 1), [1, 0])
    const v2 = new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 0, 1), [0, 1])
    return [new CSGPolygon([v0, v1, v2])]
}
