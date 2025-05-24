import Object2D from './object_2d'
import {vi, beforeEach, describe, test, expect} from 'vitest'


describe(Object2D, () => {
    let object2d

    beforeEach(() => {
        object2d = new Object2D()
    })


    test('constructor with default options', () => {
        expect(object2d.position.x).toBe(0)
        expect(object2d.position.y).toBe(0)
        expect(object2d.position.z).toBe(0)
        expect(object2d.rotation.z).toBe(0)
        expect(object2d.scale.x).toBe(1)
        expect(object2d.scale.y).toBe(1)
        expect(object2d.userData.opacity).toBe(1)
        expect(object2d.visible).toBe(true)
        expect(object2d.userData.renderType).toBe('object2d')
    })


    test('constructor with custom options', () => {
        const customObject = new Object2D({
            x: 100,
            y: 200,
            rotation: Math.PI / 2,
            scaleX: 2,
            scaleY: 3,
            opacity: 0.5,
            visible: false
        })

        expect(customObject.position.x).toBe(100)
        expect(customObject.position.y).toBe(200)
        expect(customObject.rotation.z).toBe(Math.PI / 2)
        expect(customObject.scale.x).toBe(2)
        expect(customObject.scale.y).toBe(3)
        expect(customObject.userData.opacity).toBe(0.5)
        expect(customObject.visible).toBe(false)
    })


    test('setPosition', () => {
        const result = object2d.setPosition(50, 100)
        
        expect(object2d.position.x).toBe(50)
        expect(object2d.position.y).toBe(100)
        expect(object2d.position.z).toBe(0)
        expect(result).toBe(object2d)
    })


    test('setRotation', () => {
        const result = object2d.setRotation(Math.PI / 4)
        
        expect(object2d.rotation.z).toBe(Math.PI / 4)
        expect(result).toBe(object2d)
    })


    test('setScale with two parameters', () => {
        const result = object2d.setScale(2, 3)
        
        expect(object2d.scale.x).toBe(2)
        expect(object2d.scale.y).toBe(3)
        expect(object2d.scale.z).toBe(1)
        expect(result).toBe(object2d)
    })


    test('setScale with one parameter', () => {
        const result = object2d.setScale(2)
        
        expect(object2d.scale.x).toBe(2)
        expect(object2d.scale.y).toBe(2)
        expect(object2d.scale.z).toBe(1)
        expect(result).toBe(object2d)
    })


    test('setOpacity', () => {
        const result = object2d.setOpacity(0.7)
        
        expect(object2d.userData.opacity).toBe(0.7)
        expect(result).toBe(object2d)
    })


    test('animateOpacity', () => {
        vi.useFakeTimers()
        const requestAnimationFrameSpy = vi.spyOn(global, 'requestAnimationFrame')
            .mockImplementation(cb => setTimeout(cb, 16))
        
        const callback = vi.fn()
        const result = object2d.animateOpacity(0, 1, 100, callback)
        
        expect(result).toBe(object2d)
        expect(object2d.userData.opacity).toBe(0)
        
        vi.advanceTimersByTime(50)
        expect(object2d.userData.opacity).toBeGreaterThan(0)
        expect(object2d.userData.opacity).toBeLessThan(1)
        
        vi.advanceTimersByTime(70)
        expect(object2d.userData.opacity).toBeCloseTo(1, 2)
        expect(callback).toHaveBeenCalled()
        
        requestAnimationFrameSpy.mockRestore()
        vi.useRealTimers()
    })


    test('animateOpacity without callback', () => {
        vi.useFakeTimers()
        const requestAnimationFrameSpy = vi.spyOn(global, 'requestAnimationFrame')
            .mockImplementation(cb => setTimeout(cb, 16))
        
        object2d.animateOpacity(1, 0, 100)
        
        vi.advanceTimersByTime(120)
        expect(object2d.userData.opacity).toBeCloseTo(0, 2)
        
        requestAnimationFrameSpy.mockRestore()
        vi.useRealTimers()
    })


    test('renderType uses lowercase class name', () => {
        class CustomShape extends Object2D {}
        const customShape = new CustomShape()
        
        expect(customShape.userData.renderType).toBe('customshape')
    })


    test('inherited from Three.js Object3D', () => {
        const child = new Object2D({x: 10, y: 20})
        
        object2d.add(child)
        expect(object2d.children).toContain(child)
        expect(child.parent).toBe(object2d)
        
        object2d.remove(child)
        expect(object2d.children).not.toContain(child)
        expect(child.parent).toBeNull()
    })


    test('matrix transformations', () => {
        object2d.setPosition(100, 200)
        object2d.setRotation(Math.PI / 2)
        object2d.setScale(2, 3)
        
        object2d.updateMatrixWorld(true)
        
        const matrix = object2d.matrixWorld
        expect(matrix.elements[12]).toBe(100)
        expect(matrix.elements[13]).toBe(200)
    })

})
