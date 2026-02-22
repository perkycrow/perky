import {describe, test, expect} from 'vitest'
import CSGPool, {getActivePool} from './csg_pool.js'
import CSG from './csg.js'
import Geometry from '../geometry.js'


describe('CSGPool', () => {

    test('vec3 creates vectors', () => {
        const pool = new CSGPool()
        const v = pool.vec3(1, 2, 3)
        expect(v.x).toBe(1)
        expect(v.y).toBe(2)
        expect(v.z).toBe(3)
        expect(pool.size).toBe(1)
        expect(pool.used).toBe(1)
    })


    test('vec3 reuses after reset', () => {
        const pool = new CSGPool()
        const v1 = pool.vec3(1, 2, 3)
        pool.reset()
        const v2 = pool.vec3(4, 5, 6)
        expect(v1).toBe(v2)
        expect(v2.x).toBe(4)
        expect(pool.size).toBe(1)
    })


    test('vec3 grows pool when needed', () => {
        const pool = new CSGPool()
        pool.vec3(1, 0, 0)
        pool.vec3(0, 1, 0)
        pool.vec3(0, 0, 1)
        expect(pool.size).toBe(3)
        expect(pool.used).toBe(3)
    })


    test('reset sets used to zero', () => {
        const pool = new CSGPool()
        pool.vec3(1, 0, 0)
        pool.vec3(0, 1, 0)
        expect(pool.used).toBe(2)
        pool.reset()
        expect(pool.used).toBe(0)
        expect(pool.size).toBe(2)
    })


    test('static run activates pool', () => {
        expect(getActivePool()).toBeNull()

        CSGPool.run(() => {
            expect(getActivePool()).not.toBeNull()
        })

        expect(getActivePool()).toBeNull()
    })


    test('static run restores previous pool', () => {
        expect(getActivePool()).toBeNull()

        CSGPool.run(() => {
            const outer = getActivePool()
            expect(outer).not.toBeNull()

            CSGPool.run(() => {
                const inner = getActivePool()
                expect(inner).toBe(outer)
            })

            expect(getActivePool()).toBe(outer)
        })

        expect(getActivePool()).toBeNull()
    })


    test('static run resets pool after completion', () => {
        let poolRef = null

        CSGPool.run(() => {
            poolRef = getActivePool()
            poolRef.vec3(1, 2, 3)
            expect(poolRef.used).toBe(1)
        })

        expect(poolRef.used).toBe(0)
    })


    test('CSG operations work with pool', () => {
        const result = CSGPool.run(() => {
            const a = CSG.fromGeometry(Geometry.createBox(2, 2, 2))
            const b = CSG.fromGeometry(Geometry.createBox(1, 1, 1))
            return a.subtract(b).toGeometry()
        })

        expect(result.indexCount / 3).toBeGreaterThan(12)

        for (let i = 0; i < result.indices.length; i++) {
            expect(result.indices[i]).toBeLessThan(result.vertexCount)
        }
    })

})
