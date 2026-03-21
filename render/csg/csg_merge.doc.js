import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import mergeCoplanarPolygons from './csg_merge.js'
import CSGPolygon from './csg_polygon.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


export default doc('CSGMerge', () => {

    text(`
        Merges adjacent coplanar polygons sharing an edge.
        Reduces polygon count after CSG operations by combining
        triangles back into quads where possible.
    `)


    section('Basic usage', () => {

        text('Pass an array of polygons and an epsilon for plane comparison.')

        code('Merge polygons', () => {
            const polygons = createTwoTriangles()
            const merged = mergeCoplanarPolygons(polygons, 1e-5)
        })

    })


    section('Merging adjacent triangles', () => {

        text('Two coplanar triangles sharing an edge merge into a quad.')

        action('Merge two triangles', () => {
            const polygons = createTwoTriangles()
            logger.log('before:', polygons.length, 'polygons')
            const merged = mergeCoplanarPolygons(polygons, 1e-5)
            logger.log('after:', merged.length, 'polygon')
            logger.log('vertices:', merged[0].vertices.length)
        })

    })


    section('Non-adjacent polygons', () => {

        text('Polygons without a shared edge remain separate.')

        action('No shared edge', () => {
            const t1 = createTriangleAt(0, 0)
            const t2 = createTriangleAt(10, 0)
            const merged = mergeCoplanarPolygons([t1, t2], 1e-5)
            logger.log('still separate:', merged.length === 2)
        })

    })

})


function createTwoTriangles () {
    const normal = new Vec3(0, 0, 1)
    const v0 = new CSGVertex(new Vec3(0, 0, 0), normal, [0, 0])
    const v1 = new CSGVertex(new Vec3(1, 0, 0), normal, [1, 0])
    const v2 = new CSGVertex(new Vec3(1, 1, 0), normal, [1, 1])
    const v3 = new CSGVertex(new Vec3(0, 1, 0), normal, [0, 1])
    const t1 = new CSGPolygon([v0, v1, v2])
    const t2 = new CSGPolygon([v0.clone(), v2.clone(), v3])
    return [t1, t2]
}


function createTriangleAt (x, y) {
    const normal = new Vec3(0, 0, 1)
    const v0 = new CSGVertex(new Vec3(x, y, 0), normal, [0, 0])
    const v1 = new CSGVertex(new Vec3(x + 1, y, 0), normal, [1, 0])
    const v2 = new CSGVertex(new Vec3(x, y + 1, 0), normal, [0, 1])
    return new CSGPolygon([v0, v1, v2])
}
