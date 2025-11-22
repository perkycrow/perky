import {describe, test, expect, beforeEach} from 'vitest'
import Group2D from './group_2d'
import Object2D from './object_2d'


describe(Group2D, () => {

    let group

    beforeEach(() => {
        group = new Group2D()
    })


    test('constructor', () => {
        expect(group).toBeInstanceOf(Object2D)
        expect(group.children).toEqual([])
    })


    test('constructor with options', () => {
        const g = new Group2D({
            x: 10,
            y: 20,
            rotation: Math.PI,
            scaleX: 2,
            scaleY: 3,
            opacity: 0.5,
            visible: false
        })

        expect(g.x).toBe(10)
        expect(g.y).toBe(20)
        expect(g.rotation).toBe(Math.PI)
        expect(g.scaleX).toBe(2)
        expect(g.scaleY).toBe(3)
        expect(g.opacity).toBe(0.5)
        expect(g.visible).toBe(false)
    })


    test('addChild', () => {
        const child1 = new Object2D()
        const child2 = new Object2D()

        const result = group.addChild(child1, child2)

        expect(group.children).toEqual([child1, child2])
        expect(child1.parent).toBe(group)
        expect(child2.parent).toBe(group)
        expect(result).toBe(group)
    })


    test('addChild with single child', () => {
        const child = new Object2D()

        group.addChild(child)

        expect(group.children).toEqual([child])
        expect(child.parent).toBe(group)
    })


    test('addChild is fluent', () => {
        const child = new Object2D()

        const result = group.addChild(child).setPosition(10, 20)

        expect(result).toBe(group)
        expect(group.x).toBe(10)
        expect(group.y).toBe(20)
    })


    test('nested groups', () => {
        const parent = new Group2D()
        const child = new Group2D()
        const grandchild = new Object2D()

        parent.addChild(child)
        child.addChild(grandchild)

        expect(parent.children).toEqual([child])
        expect(child.children).toEqual([grandchild])
        expect(child.parent).toBe(parent)
        expect(grandchild.parent).toBe(child)
    })


    test('world matrix propagation', () => {
        const parent = new Group2D()
        parent.x = 10
        parent.y = 20

        const child = new Group2D()
        child.x = 5
        child.y = 5

        parent.addChild(child)
        parent.updateWorldMatrix()

        const m = child.worldMatrix
        expect(m[4]).toBeCloseTo(15)
        expect(m[5]).toBeCloseTo(25)
    })

})
