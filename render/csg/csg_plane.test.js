import {describe, test, expect} from 'vitest'
import CSGPlane, {COPLANAR, FRONT, BACK, SPANNING} from './csg_plane.js'
import CSGPolygon from './csg_polygon.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


describe('CSGPlane', () => {

    test('constructor', () => {
        const plane = new CSGPlane(new Vec3(0, 1, 0), 5)
        expect(plane.normal.y).toBe(1)
        expect(plane.w).toBe(5)
    })


    test('clone', () => {
        const plane = new CSGPlane(new Vec3(0, 1, 0), 5)
        const c = plane.clone()
        c.normal.y = 0
        expect(plane.normal.y).toBe(1)
    })


    test('flip', () => {
        const plane = new CSGPlane(new Vec3(0, 1, 0), 5)
        plane.flip()
        expect(plane.normal.y).toBe(-1)
        expect(plane.w).toBe(-5)
    })


    test('splitPolygon front', () => {
        const plane = new CSGPlane(new Vec3(0, 1, 0), -1)
        const triangle = new CSGPolygon([
            new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 1, 0), [0, 0]),
            new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 1, 0), [1, 0]),
            new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 1, 0), [0, 1])
        ])
        const cf = [], cb = [], f = [], b = []
        plane.splitPolygon(triangle, cf, cb, f, b, 1e-5)
        expect(f).toHaveLength(1)
        expect(b).toHaveLength(0)
    })


    test('splitPolygon back', () => {
        const plane = new CSGPlane(new Vec3(0, 1, 0), 2)
        const triangle = new CSGPolygon([
            new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 1, 0), [0, 0]),
            new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 1, 0), [1, 0]),
            new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 1, 0), [0, 1])
        ])
        const cf = [], cb = [], f = [], b = []
        plane.splitPolygon(triangle, cf, cb, f, b, 1e-5)
        expect(f).toHaveLength(0)
        expect(b).toHaveLength(1)
    })


    test('splitPolygon coplanar same direction', () => {
        const plane = new CSGPlane(new Vec3(0, 0, 1), 0)
        const triangle = new CSGPolygon([
            new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 0, 1), [0, 0]),
            new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 0, 1), [1, 0]),
            new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 0, 1), [0, 1])
        ])
        const cf = [], cb = [], f = [], b = []
        plane.splitPolygon(triangle, cf, cb, f, b, 1e-5)
        expect(cf).toHaveLength(1)
        expect(cb).toHaveLength(0)
    })


    test('splitPolygon coplanar opposite direction', () => {
        const plane = new CSGPlane(new Vec3(0, 0, -1), 0)
        const triangle = new CSGPolygon([
            new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 0, 1), [0, 0]),
            new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 0, 1), [1, 0]),
            new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 0, 1), [0, 1])
        ])
        const cf = [], cb = [], f = [], b = []
        plane.splitPolygon(triangle, cf, cb, f, b, 1e-5)
        expect(cf).toHaveLength(0)
        expect(cb).toHaveLength(1)
    })


    test('splitPolygon spanning', () => {
        const plane = new CSGPlane(new Vec3(0, 1, 0), 0.5)
        const triangle = new CSGPolygon([
            new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 0, 1), [0, 0]),
            new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 0, 1), [1, 0]),
            new CSGVertex(new Vec3(0.5, 1, 0), new Vec3(0, 0, 1), [0.5, 1])
        ])
        const cf = [], cb = [], f = [], b = []
        plane.splitPolygon(triangle, cf, cb, f, b, 1e-5)
        expect(f).toHaveLength(1)
        expect(b).toHaveLength(1)
        expect(f[0].vertices.length).toBeGreaterThanOrEqual(3)
        expect(b[0].vertices.length).toBeGreaterThanOrEqual(3)
    })


    test('spanning split preserves interpolated positions', () => {
        const plane = new CSGPlane(new Vec3(0, 1, 0), 0.5)
        const triangle = new CSGPolygon([
            new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 0, 1), [0, 0]),
            new CSGVertex(new Vec3(1, 0, 0), new Vec3(0, 0, 1), [1, 0]),
            new CSGVertex(new Vec3(0, 1, 0), new Vec3(0, 0, 1), [0, 1])
        ])
        const cf = [], cb = [], f = [], b = []
        plane.splitPolygon(triangle, cf, cb, f, b, 1e-5)
        const frontVertices = f[0].vertices
        const allY = frontVertices.map(v => v.position.y)
        for (const y of allY) {
            expect(y).toBeGreaterThanOrEqual(0.5 - 1e-4)
        }
    })


    test('constants', () => {
        expect(COPLANAR).toBe(0)
        expect(FRONT).toBe(1)
        expect(BACK).toBe(2)
        expect(SPANNING).toBe(3)
    })

})
