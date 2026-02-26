import {describe, test, expect} from 'vitest'
import applyTriplanarUVs from './csg_triplanar.js'
import CSGPolygon from './csg_polygon.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


describe('applyTriplanarUVs', () => {

    function vertex (x, y, z, u = 0, v = 0) {
        return new CSGVertex(new Vec3(x, y, z), new Vec3(0, 1, 0), [u, v])
    }


    test('projects UVs for collapsed-UV polygon', () => {
        const p = new CSGPolygon([vertex(1, 0, 0), vertex(2, 0, 0), vertex(1, 0, 1)])
        applyTriplanarUVs([p], 1)
        expect(p.vertices[0].uv[0]).toBeCloseTo(1, 3)
        expect(p.vertices[1].uv[0]).toBeCloseTo(2, 3)
    })


    test('skips polygon with non-collapsed UVs', () => {
        const p = new CSGPolygon([vertex(1, 0, 0, 0, 0), vertex(2, 0, 0, 1, 0), vertex(1, 0, 1, 0, 1)])
        applyTriplanarUVs([p], 1)
        expect(p.vertices[0].uv[0]).toBe(0)
        expect(p.vertices[1].uv[0]).toBe(1)
    })


    test('respects uvScale', () => {
        const p = new CSGPolygon([vertex(1, 0, 0), vertex(2, 0, 0), vertex(1, 0, 1)])
        applyTriplanarUVs([p], 2)
        expect(p.vertices[0].uv[0]).toBeCloseTo(2, 3)
        expect(p.vertices[1].uv[0]).toBeCloseTo(4, 3)
    })


    test('uses z/y for x-dominant normal', () => {
        const v1 = new CSGVertex(new Vec3(0, 1, 2), new Vec3(1, 0, 0), [0, 0])
        const v2 = new CSGVertex(new Vec3(0, 3, 4), new Vec3(1, 0, 0), [0, 0])
        const v3 = new CSGVertex(new Vec3(0, 1, 4), new Vec3(1, 0, 0), [0, 0])
        const p = new CSGPolygon([v1, v2, v3])
        applyTriplanarUVs([p], 1)
        expect(p.vertices[0].uv[0]).toBeCloseTo(2, 3)
        expect(p.vertices[0].uv[1]).toBeCloseTo(1, 3)
    })


    test('empty input is safe', () => {
        applyTriplanarUVs([], 1)
    })

})
