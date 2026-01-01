import {describe, test, expect, beforeEach} from 'vitest'
import Object2D from './object_2d.js'


describe(Object2D, () => {

    let object

    beforeEach(() => {
        object = new Object2D()
    })


    test('constructor defaults', () => {
        expect(object.visible).toBe(true)
        expect(object.opacity).toBe(1)
        expect(object.depth).toBe(0)
        expect(object.anchorX).toBe(0.5)
        expect(object.anchorY).toBe(0.5)
        expect(object.x).toBe(0)
        expect(object.y).toBe(0)
        expect(object.rotation).toBe(0)
        expect(object.scaleX).toBe(1)
        expect(object.scaleY).toBe(1)
    })


    test('constructor with options', () => {
        const obj = new Object2D({
            x: 10,
            y: 20,
            rotation: Math.PI,
            scaleX: 2,
            scaleY: 3,
            opacity: 0.5,
            depth: 5,
            visible: false,
            anchorX: 0.25,
            anchorY: 0.75,
            pivotX: 5,
            pivotY: 10
        })

        expect(obj.x).toBe(10)
        expect(obj.y).toBe(20)
        expect(obj.rotation).toBe(Math.PI)
        expect(obj.scaleX).toBe(2)
        expect(obj.scaleY).toBe(3)
        expect(obj.opacity).toBe(0.5)
        expect(obj.depth).toBe(5)
        expect(obj.visible).toBe(false)
        expect(obj.anchorX).toBe(0.25)
        expect(obj.anchorY).toBe(0.75)
        expect(obj.pivotX).toBe(5)
        expect(obj.pivotY).toBe(10)
    })


    test('setPosition', () => {
        const result = object.setPosition(10, 20)
        
        expect(object.x).toBe(10)
        expect(object.y).toBe(20)
        expect(result).toBe(object)
    })


    test('setRotation', () => {
        const result = object.setRotation(Math.PI / 2)
        
        expect(object.rotation).toBeCloseTo(Math.PI / 2)
        expect(result).toBe(object)
    })


    test('setScale with two values', () => {
        const result = object.setScale(2, 3)
        
        expect(object.scaleX).toBe(2)
        expect(object.scaleY).toBe(3)
        expect(result).toBe(object)
    })


    test('setScale with one value', () => {
        const result = object.setScale(2)
        
        expect(object.scaleX).toBe(2)
        expect(object.scaleY).toBe(2)
        expect(result).toBe(object)
    })


    test('setOpacity', () => {
        const result = object.setOpacity(0.5)

        expect(object.opacity).toBe(0.5)
        expect(result).toBe(object)
    })


    test('setDepth', () => {
        const result = object.setDepth(10)

        expect(object.depth).toBe(10)
        expect(result).toBe(object)
    })


    test('setAnchor with two values', () => {
        const result = object.setAnchor(0.25, 0.75)
        
        expect(object.anchorX).toBe(0.25)
        expect(object.anchorY).toBe(0.75)
        expect(result).toBe(object)
    })


    test('setAnchor with one value', () => {
        const result = object.setAnchor(0.25)
        
        expect(object.anchorX).toBe(0.25)
        expect(object.anchorY).toBe(0.25)
        expect(result).toBe(object)
    })


    test('setPivot', () => {
        const result = object.setPivot(5, 10)
        
        expect(object.pivotX).toBe(5)
        expect(object.pivotY).toBe(10)
        expect(result).toBe(object)
    })


    test('render does nothing by default', () => {
        expect(() => object.render({})).not.toThrow()
    })


    test('fluent interface', () => {
        const result = object
            .setPosition(10, 20)
            .setRotation(Math.PI)
            .setScale(2, 3)
            .setOpacity(0.5)
            .setDepth(7)
            .setAnchor(0.25, 0.75)
            .setPivot(5, 10)

        expect(result).toBe(object)
        expect(object.x).toBe(10)
        expect(object.y).toBe(20)
        expect(object.rotation).toBeCloseTo(Math.PI)
        expect(object.scaleX).toBe(2)
        expect(object.scaleY).toBe(3)
        expect(object.opacity).toBe(0.5)
        expect(object.depth).toBe(7)
        expect(object.anchorX).toBe(0.25)
        expect(object.anchorY).toBe(0.75)
        expect(object.pivotX).toBe(5)
        expect(object.pivotY).toBe(10)
    })


    test('getBounds default', () => {
        const bounds = object.getBounds()

        expect(bounds.minX).toBe(0)
        expect(bounds.minY).toBe(0)
        expect(bounds.maxX).toBe(0)
        expect(bounds.maxY).toBe(0)
        expect(bounds.width).toBe(0)
        expect(bounds.height).toBe(0)
    })


    test('getWorldBounds with translation', () => {
        object.x = 10
        object.y = 20
        object.getBounds = () => ({minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10})
        object.updateWorldMatrix()

        const bounds = object.getWorldBounds()

        expect(bounds.minX).toBeCloseTo(10)
        expect(bounds.minY).toBeCloseTo(20)
        expect(bounds.maxX).toBeCloseTo(20)
        expect(bounds.maxY).toBeCloseTo(30)
    })


    test('getWorldBounds with scale', () => {
        object.scaleX = 2
        object.scaleY = 2
        object.getBounds = () => ({minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10})
        object.updateWorldMatrix()

        const bounds = object.getWorldBounds()

        expect(bounds.width).toBeCloseTo(20)
        expect(bounds.height).toBeCloseTo(20)
    })

})
