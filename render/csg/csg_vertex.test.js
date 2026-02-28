import {describe, test, expect} from 'vitest'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


describe('CSGVertex', () => {

    test('constructor', () => {
        const v = new CSGVertex(new Vec3(1, 2, 3), new Vec3(0, 1, 0), [0.5, 0.5])
        expect(v.position.x).toBe(1)
        expect(v.position.y).toBe(2)
        expect(v.position.z).toBe(3)
        expect(v.normal.y).toBe(1)
        expect(v.uv[0]).toBe(0.5)
        expect(v.uv[1]).toBe(0.5)
        expect(v.color).toEqual([1, 1, 1])
    })


    test('constructor with color', () => {
        const v = new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 1, 0), [0, 0], [0.9, 0.3, 0.3])
        expect(v.color).toEqual([0.9, 0.3, 0.3])
    })


    test('clone', () => {
        const v = new CSGVertex(new Vec3(1, 2, 3), new Vec3(0, 1, 0), [0.5, 0.5], [0.9, 0.3, 0.3])
        const c = v.clone()
        expect(c.position.x).toBe(1)
        expect(c.normal.y).toBe(1)
        expect(c.uv[0]).toBe(0.5)
        expect(c.color).toEqual([0.9, 0.3, 0.3])
        c.position.x = 99
        expect(v.position.x).toBe(1)
        c.uv[0] = 99
        expect(v.uv[0]).toBe(0.5)
        c.color[0] = 0
        expect(v.color[0]).toBe(0.9)
    })


    test('interpolate t=0', () => {
        const a = new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 1, 0), [0, 0], [1, 0, 0])
        const b = new CSGVertex(new Vec3(10, 0, 0), new Vec3(1, 0, 0), [1, 1], [0, 0, 1])
        const result = a.interpolate(b, 0)
        expect(result.position.x).toBe(0)
        expect(result.position.y).toBe(0)
        expect(result.uv[0]).toBe(0)
        expect(result.uv[1]).toBe(0)
        expect(result.color).toEqual([1, 0, 0])
    })


    test('interpolate t=1', () => {
        const a = new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 1, 0), [0, 0], [1, 0, 0])
        const b = new CSGVertex(new Vec3(10, 0, 0), new Vec3(1, 0, 0), [1, 1], [0, 0, 1])
        const result = a.interpolate(b, 1)
        expect(result.position.x).toBe(10)
        expect(result.uv[0]).toBe(1)
        expect(result.uv[1]).toBe(1)
        expect(result.color).toEqual([0, 0, 1])
    })


    test('interpolate t=0.5', () => {
        const a = new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 1, 0), [0, 0], [1, 0, 0])
        const b = new CSGVertex(new Vec3(10, 0, 0), new Vec3(1, 0, 0), [1, 1], [0, 0, 1])
        const result = a.interpolate(b, 0.5)
        expect(result.position.x).toBe(5)
        expect(result.uv[0]).toBe(0.5)
        const len = result.normal.length()
        expect(len).toBeCloseTo(1, 5)
        expect(result.color[0]).toBeCloseTo(0.5)
        expect(result.color[1]).toBe(0)
        expect(result.color[2]).toBeCloseTo(0.5)
    })


    test('interpolate normalizes normal', () => {
        const a = new CSGVertex(new Vec3(0, 0, 0), new Vec3(0, 1, 0), [0, 0])
        const b = new CSGVertex(new Vec3(1, 0, 0), new Vec3(1, 0, 0), [1, 1])
        const result = a.interpolate(b, 0.3)
        expect(result.normal.length()).toBeCloseTo(1, 5)
    })

})
