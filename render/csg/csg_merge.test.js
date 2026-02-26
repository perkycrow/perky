import {describe, test, expect} from 'vitest'
import mergeCoplanarPolygons from './csg_merge.js'
import CSGPolygon from './csg_polygon.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


describe('mergeCoplanarPolygons', () => {

    function vertex (x, y, z) {
        return new CSGVertex(new Vec3(x, y, z), new Vec3(0, 0, 1), [x, y])
    }


    test('no merge when single polygon', () => {
        const p = new CSGPolygon([vertex(0, 0, 0), vertex(1, 0, 0), vertex(0, 1, 0)])
        const result = mergeCoplanarPolygons([p], 1e-5)
        expect(result).toHaveLength(1)
    })


    test('merges two coplanar triangles sharing an edge', () => {
        const p1 = new CSGPolygon([vertex(0, 0, 0), vertex(1, 0, 0), vertex(0, 1, 0)])
        const p2 = new CSGPolygon([vertex(1, 0, 0), vertex(0, 0, 0), vertex(1, -1, 0)])
        const result = mergeCoplanarPolygons([p1, p2], 1e-5)
        expect(result).toHaveLength(1)
        expect(result[0].vertices.length).toBe(4)
    })


    test('does not merge non-coplanar polygons', () => {
        const p1 = new CSGPolygon([vertex(0, 0, 0), vertex(1, 0, 0), vertex(0, 1, 0)])
        const p2 = new CSGPolygon([
            new CSGVertex(new Vec3(0, 0, 1), new Vec3(0, 1, 0), [0, 0]),
            new CSGVertex(new Vec3(1, 0, 1), new Vec3(0, 1, 0), [1, 0]),
            new CSGVertex(new Vec3(0, 0, 2), new Vec3(0, 1, 0), [0, 1])
        ])
        const result = mergeCoplanarPolygons([p1, p2], 1e-5)
        expect(result).toHaveLength(2)
    })


    test('does not merge if result is concave', () => {
        const p1 = new CSGPolygon([vertex(0, 0, 0), vertex(2, 0, 0), vertex(1, 0.1, 0)])
        const p2 = new CSGPolygon([vertex(2, 0, 0), vertex(0, 0, 0), vertex(1, -0.1, 0)])
        const result = mergeCoplanarPolygons([p1, p2], 1e-5)
        expect(result).toHaveLength(1)
        expect(result[0].vertices.length).toBe(4)
    })


    test('does not merge polygons without shared edge', () => {
        const p1 = new CSGPolygon([vertex(0, 0, 0), vertex(1, 0, 0), vertex(0, 1, 0)])
        const p2 = new CSGPolygon([vertex(3, 0, 0), vertex(4, 0, 0), vertex(3, 1, 0)])
        const result = mergeCoplanarPolygons([p1, p2], 1e-5)
        expect(result).toHaveLength(2)
    })


    test('empty input returns empty', () => {
        expect(mergeCoplanarPolygons([], 1e-5)).toHaveLength(0)
    })

})
