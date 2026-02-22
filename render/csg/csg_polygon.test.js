import {describe, test, expect} from 'vitest'
import CSGPolygon from './csg_polygon.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


describe('CSGPolygon', () => {

    function makeTriangle () {
        return new CSGPolygon([
            new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 0, 1), [0, 0]),
            new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 0, 1), [1, 0]),
            new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 0, 1), [0, 1])
        ])
    }


    test('constructor computes plane', () => {
        const p = makeTriangle()
        expect(p.plane.normal.z).toBeCloseTo(1, 5)
        expect(p.plane.w).toBeCloseTo(0, 5)
    })


    test('constructor accepts explicit plane', () => {
        const vertices = [
            new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 1, 0), [0, 0]),
            new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 1, 0), [1, 0]),
            new CSGVertex(new Vec3(0, 0, 1), new Vec3(0, 1, 0), [0, 1])
        ]
        const plane = {normal: new Vec3(0, 1, 0), w: 0}
        const p = new CSGPolygon(vertices, plane)
        expect(p.plane.normal.y).toBe(1)
    })


    test('clone', () => {
        const p = makeTriangle()
        const c = p.clone()
        c.vertices[0].position.x = 99
        expect(p.vertices[0].position.x).toBe(0)
        c.plane.normal.z = 0
        expect(p.plane.normal.z).toBeCloseTo(1, 5)
    })


    test('flip reverses vertices and negates plane', () => {
        const p = makeTriangle()
        p.flip()
        expect(p.plane.normal.z).toBeCloseTo(-1, 5)
        expect(p.plane.w).toBeCloseTo(0, 5)
        expect(p.vertices[0].uv[1]).toBe(1)
        expect(p.vertices[2].uv[0]).toBe(0)
        expect(p.vertices[2].uv[1]).toBe(0)
    })

})
