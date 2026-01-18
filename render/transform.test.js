import {describe, test, expect, beforeEach} from 'vitest'
import Transform from './transform.js'


describe(Transform, () => {

    let transform

    beforeEach(() => {
        transform = new Transform()
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
        const child1 = new Transform()
        const child2 = new Transform()

        transform.add(child1, child2)

        expect(transform.children).toEqual([child1, child2])
        expect(child1.parent).toBe(transform)
        expect(child2.parent).toBe(transform)
    })


    test('add child removes from previous parent', () => {
        const parent1 = new Transform()
        const parent2 = new Transform()
        const child = new Transform()

        parent1.add(child)
        expect(parent1.children).toEqual([child])
        expect(child.parent).toBe(parent1)

        parent2.add(child)
        expect(parent1.children).toEqual([])
        expect(parent2.children).toEqual([child])
        expect(child.parent).toBe(parent2)
    })


    test('remove child', () => {
        const child = new Transform()

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
        const parent = new Transform()
        parent.x = 10
        parent.y = 20

        const child = new Transform()
        child.x = 5
        child.y = 5

        parent.add(child)
        parent.updateWorldMatrix()

        const m = child.worldMatrix
        expect(m[4]).toBeCloseTo(15)
        expect(m[5]).toBeCloseTo(25)
    })


    test('markDirty propagates to children', () => {
        const child1 = new Transform()
        const child2 = new Transform()

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


    test('getSortedChildren returns children sorted by depth', () => {
        const child1 = new Transform()
        child1.depth = 2
        const child2 = new Transform()
        child2.depth = 0
        const child3 = new Transform()
        child3.depth = 1

        transform.add(child1, child2, child3)

        const sorted = transform.getSortedChildren()

        expect(sorted[0]).toBe(child2)
        expect(sorted[1]).toBe(child3)
        expect(sorted[2]).toBe(child1)
    })


    test('getSortedChildren caches result', () => {
        const child1 = new Transform()
        child1.depth = 1
        const child2 = new Transform()
        child2.depth = 0

        transform.add(child1, child2)

        const sorted1 = transform.getSortedChildren()
        const sorted2 = transform.getSortedChildren()

        expect(sorted1).toBe(sorted2)
    })


    test('markChildrenNeedSort invalidates cache', () => {
        const child1 = new Transform()
        child1.depth = 1
        const child2 = new Transform()
        child2.depth = 0

        transform.add(child1, child2)

        const sorted1 = transform.getSortedChildren()
        transform.markChildrenNeedSort()
        const sorted2 = transform.getSortedChildren()

        expect(sorted1).not.toBe(sorted2)
    })


    test('add triggers re-sort on next getSortedChildren call', () => {
        const child1 = new Transform()
        child1.depth = 1

        transform.add(child1)
        transform.getSortedChildren()

        const child2 = new Transform()
        child2.depth = 0
        transform.add(child2)

        const sorted2 = transform.getSortedChildren()
        expect(sorted2[0]).toBe(child2)
        expect(sorted2[1]).toBe(child1)
    })


    test('remove triggers re-sort on next getSortedChildren call', () => {
        const child1 = new Transform()
        child1.depth = 0
        const child2 = new Transform()
        child2.depth = 1

        transform.add(child1, child2)
        const sorted1 = transform.getSortedChildren()
        expect(sorted1.length).toBe(2)

        transform.remove(child1)
        const sorted2 = transform.getSortedChildren()
        expect(sorted2.length).toBe(1)
        expect(sorted2[0]).toBe(child2)
    })


    test('transformPoint with identity matrix', () => {
        transform.updateWorldMatrix()

        const result = transform.transformPoint({x: 10, y: 20})

        expect(result.x).toBeCloseTo(10)
        expect(result.y).toBeCloseTo(20)
    })


    test('transformPoint with translation', () => {
        transform.x = 5
        transform.y = 10
        transform.updateWorldMatrix()

        const result = transform.transformPoint({x: 10, y: 20})

        expect(result.x).toBeCloseTo(15)
        expect(result.y).toBeCloseTo(30)
    })


    test('transformPoint with scale', () => {
        transform.scaleX = 2
        transform.scaleY = 3
        transform.updateWorldMatrix()

        const result = transform.transformPoint({x: 10, y: 20})

        expect(result.x).toBeCloseTo(20)
        expect(result.y).toBeCloseTo(60)
    })


    test('transformPoint with rotation', () => {
        transform.rotation = Math.PI / 2
        transform.updateWorldMatrix()

        const result = transform.transformPoint({x: 10, y: 0})

        expect(result.x).toBeCloseTo(0)
        expect(result.y).toBeCloseTo(10)
    })


    test('markDirty skips already dirty children', () => {
        const child1 = new Transform()
        const child2 = new Transform()
        const grandchild = new Transform()

        transform.add(child1)
        child1.add(grandchild)
        transform.add(child2)

        // All start dirty, so clear them
        transform.updateWorldMatrix()

        // Mark only child1 dirty
        child1.markDirty()

        // Now mark parent dirty - should not re-traverse child1's subtree
        // since child1 is already dirty
        let markDirtyCallCount = 0
        const originalMarkDirty = grandchild.markDirty.bind(grandchild)
        grandchild.markDirty = () => {
            markDirtyCallCount++
            originalMarkDirty()
        }

        transform.markDirty()

        // grandchild.markDirty should only be called once (from child1, not from transform)
        // because child1 was already dirty and should short-circuit
        expect(markDirtyCallCount).toBe(0)
    })


    test('markDirty propagates when not already dirty', () => {
        const child = new Transform()
        const grandchild = new Transform()

        transform.add(child)
        child.add(grandchild)

        // Clear dirty flags
        transform.updateWorldMatrix()

        // Track if grandchild gets marked
        let grandchildMarked = false
        const originalMarkDirty = grandchild.markDirty.bind(grandchild)
        grandchild.markDirty = () => {
            grandchildMarked = true
            originalMarkDirty()
        }

        transform.markDirty()

        expect(grandchildMarked).toBe(true)
    })

})

