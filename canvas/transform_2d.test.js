import {describe, test, expect, beforeEach} from 'vitest'
import Transform2D from './transform_2d'


describe(Transform2D, () => {

    let transform

    beforeEach(() => {
        transform = new Transform2D()
    })


    test('constructor', () => {
        expect(transform.x).toBe(0)
        expect(transform.y).toBe(0)
        expect(transform.rotation).toBe(0)
        expect(transform.scaleX).toBe(1)
        expect(transform.scaleY).toBe(1)
        expect(transform.pivotX).toBe(0)
        expect(transform.pivotY).toBe(0)
        expect(transform.parent).toBe(null)
        expect(transform.children).toEqual([])
    })


    test('add child', () => {
        const child1 = new Transform2D()
        const child2 = new Transform2D()

        transform.add(child1, child2)

        expect(transform.children).toEqual([child1, child2])
        expect(child1.parent).toBe(transform)
        expect(child2.parent).toBe(transform)
    })


    test('add child removes from previous parent', () => {
        const parent1 = new Transform2D()
        const parent2 = new Transform2D()
        const child = new Transform2D()

        parent1.add(child)
        expect(parent1.children).toEqual([child])
        expect(child.parent).toBe(parent1)

        parent2.add(child)
        expect(parent1.children).toEqual([])
        expect(parent2.children).toEqual([child])
        expect(child.parent).toBe(parent2)
    })


    test('remove child', () => {
        const child = new Transform2D()

        transform.add(child)
        expect(transform.children).toEqual([child])

        transform.remove(child)
        expect(transform.children).toEqual([])
        expect(child.parent).toBe(null)
    })


    test('updateLocalMatrix identity', () => {
        transform.updateLocalMatrix()
        const m = transform.worldMatrix

        expect(m[0]).toBeCloseTo(1)
        expect(m[1]).toBeCloseTo(0)
        expect(m[2]).toBeCloseTo(0)
        expect(m[3]).toBeCloseTo(1)
        expect(m[4]).toBeCloseTo(0)
        expect(m[5]).toBeCloseTo(0)
    })


    test('updateLocalMatrix with translation', () => {
        transform.x = 10
        transform.y = 20
        transform.updateWorldMatrix()
        const m = transform.worldMatrix

        expect(m[0]).toBeCloseTo(1)
        expect(m[1]).toBeCloseTo(0)
        expect(m[2]).toBeCloseTo(0)
        expect(m[3]).toBeCloseTo(1)
        expect(m[4]).toBeCloseTo(10)
        expect(m[5]).toBeCloseTo(20)
    })


    test('updateLocalMatrix with rotation', () => {
        transform.rotation = Math.PI / 2
        transform.updateWorldMatrix()
        const m = transform.worldMatrix

        expect(m[0]).toBeCloseTo(0)
        expect(m[1]).toBeCloseTo(1)
        expect(m[2]).toBeCloseTo(-1)
        expect(m[3]).toBeCloseTo(0)
        expect(m[4]).toBeCloseTo(0)
        expect(m[5]).toBeCloseTo(0)
    })


    test('updateLocalMatrix with scale', () => {
        transform.scaleX = 2
        transform.scaleY = 3
        transform.updateWorldMatrix()
        const m = transform.worldMatrix

        expect(m[0]).toBeCloseTo(2)
        expect(m[1]).toBeCloseTo(0)
        expect(m[2]).toBeCloseTo(0)
        expect(m[3]).toBeCloseTo(3)
        expect(m[4]).toBeCloseTo(0)
        expect(m[5]).toBeCloseTo(0)
    })


    test('updateWorldMatrix without parent', () => {
        transform.x = 5
        transform.y = 10
        transform.updateWorldMatrix()
        const m = transform.worldMatrix

        expect(m[4]).toBeCloseTo(5)
        expect(m[5]).toBeCloseTo(10)
    })


    test('updateWorldMatrix with parent', () => {
        const parent = new Transform2D()
        parent.x = 10
        parent.y = 20

        const child = new Transform2D()
        child.x = 5
        child.y = 5

        parent.add(child)
        parent.updateWorldMatrix()

        const m = child.worldMatrix
        expect(m[4]).toBeCloseTo(15)
        expect(m[5]).toBeCloseTo(25)
    })


    test('markDirty propagates to children', () => {
        const child1 = new Transform2D()
        const child2 = new Transform2D()
        
        transform.add(child1)
        child1.add(child2)

        transform.updateWorldMatrix()
        child1.updateWorldMatrix()
        child2.updateWorldMatrix()

        transform.markDirty()
        
        transform.x = 100
        transform.updateWorldMatrix()

        const m = child2.worldMatrix
        expect(m[4]).toBeCloseTo(100)
    })

})

