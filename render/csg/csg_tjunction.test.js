import {describe, test, expect} from 'vitest'
import suppressTJunctions from './csg_tjunction.js'
import CSGPolygon from './csg_polygon.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


describe('suppressTJunctions', () => {

    function vertex (x, y, z) {
        return new CSGVertex(new Vec3(x, y, z), new Vec3(0, 0, 1), [0, 0])
    }


    test('no change when no T-junctions', () => {
        const p1 = new CSGPolygon([vertex(0, 0, 0), vertex(1, 0, 0), vertex(0, 1, 0)])
        const p2 = new CSGPolygon([vertex(2, 0, 0), vertex(3, 0, 0), vertex(2, 1, 0)])
        const result = suppressTJunctions([p1, p2], 1e-5)
        expect(result).toBe(result)
        expect(result[0].vertices).toHaveLength(3)
    })


    test('inserts vertex on edge with T-junction', () => {
        const p1 = new CSGPolygon([vertex(0, 0, 0), vertex(2, 0, 0), vertex(1, 1, 0)])
        const p2 = new CSGPolygon([vertex(1, 0, 0), vertex(1, -1, 0), vertex(2, -1, 0)])
        const result = suppressTJunctions([p1, p2], 1e-3)
        expect(result[0].vertices.length).toBeGreaterThan(3)
    })


    test('inserted vertex has correct position', () => {
        const p1 = new CSGPolygon([vertex(0, 0, 0), vertex(2, 0, 0), vertex(1, 1, 0)])
        const p2 = new CSGPolygon([vertex(1, 0, 0), vertex(1, -1, 0), vertex(0, -1, 0)])
        const result = suppressTJunctions([p1, p2], 1e-3)
        const inserted = result[0].vertices[1]
        expect(inserted.position.x).toBeCloseTo(1, 3)
        expect(inserted.position.y).toBeCloseTo(0, 3)
    })


    test('preserves polygon plane', () => {
        const p1 = new CSGPolygon([vertex(0, 0, 0), vertex(2, 0, 0), vertex(1, 1, 0)])
        const p2 = new CSGPolygon([vertex(1, 0, 0), vertex(1, -1, 0), vertex(0, -1, 0)])
        const result = suppressTJunctions([p1, p2], 1e-3)
        expect(result[0].plane.normal.z).toBeCloseTo(1, 3)
    })


    test('handles multiple midpoints on same edge', () => {
        const p1 = new CSGPolygon([vertex(0, 0, 0), vertex(3, 0, 0), vertex(1.5, 1, 0)])
        const p2 = new CSGPolygon([vertex(1, 0, 0), vertex(1, -1, 0), vertex(0, -1, 0)])
        const p3 = new CSGPolygon([vertex(2, 0, 0), vertex(2, -1, 0), vertex(1, -1, 0)])
        const result = suppressTJunctions([p1, p2, p3], 1e-3)
        expect(result[0].vertices.length).toBe(5)
    })


    test('empty input returns empty', () => {
        expect(suppressTJunctions([], 1e-5)).toHaveLength(0)
    })

})
