import Rectangle from './rectangle'
import Object2D from './object_2d'
import {beforeEach, describe, test, expect} from 'vitest'


describe(Rectangle, () => {
    let rectangle

    beforeEach(() => {
        rectangle = new Rectangle()
    })


    test('constructor with default options', () => {
        expect(rectangle).toBeInstanceOf(Object2D)
        expect(rectangle.userData.width).toBe(100)
        expect(rectangle.userData.height).toBe(100)
        expect(rectangle.userData.color).toBe('#4444ff')
        expect(rectangle.userData.strokeColor).toBe('#333333')
        expect(rectangle.userData.strokeWidth).toBe(2)
        expect(rectangle.userData.renderType).toBe('rectangle')
    })


    test('constructor with custom options', () => {
        const customRect = new Rectangle({
            x: 50,
            y: 100,
            width: 200,
            height: 150,
            color: '#ff0000',
            strokeColor: '#00ff00',
            strokeWidth: 4,
            rotation: Math.PI / 4,
            opacity: 0.6
        })

        expect(customRect.position.x).toBe(50)
        expect(customRect.position.y).toBe(100)
        expect(customRect.userData.width).toBe(200)
        expect(customRect.userData.height).toBe(150)
        expect(customRect.userData.color).toBe('#ff0000')
        expect(customRect.userData.strokeColor).toBe('#00ff00')
        expect(customRect.userData.strokeWidth).toBe(4)
        expect(customRect.rotation.z).toBe(-(Math.PI / 4))
        expect(customRect.userData.opacity).toBe(0.6)
    })


    test('setSize with two parameters', () => {
        const result = rectangle.setSize(200, 150)
        
        expect(rectangle.userData.width).toBe(200)
        expect(rectangle.userData.height).toBe(150)
        expect(result).toBe(rectangle)
    })


    test('setSize with one parameter creates square', () => {
        const result = rectangle.setSize(200)
        
        expect(rectangle.userData.width).toBe(200)
        expect(rectangle.userData.height).toBe(200)
        expect(result).toBe(rectangle)
    })


    test('setColor', () => {
        const result = rectangle.setColor('#abcdef')
        
        expect(rectangle.userData.color).toBe('#abcdef')
        expect(result).toBe(rectangle)
    })


    test('inherited methods from Object2D', () => {
        rectangle.setPosition(25, 50)
        rectangle.setRotation(Math.PI / 6)
        rectangle.setScale(1.5, 2)
        rectangle.setOpacity(0.3)

        expect(rectangle.position.x).toBe(25)
        expect(rectangle.position.y).toBe(50)
        expect(rectangle.rotation.z).toBe(-(Math.PI / 6))
        expect(rectangle.scale.x).toBe(1.5)
        expect(rectangle.scale.y).toBe(2)
        expect(rectangle.userData.opacity).toBe(0.3)
    })


    test('renderType is properly set', () => {
        expect(rectangle.userData.renderType).toBe('rectangle')
    })


    test('can be added to parent', () => {
        const parent = new Object2D()
        parent.add(rectangle)
        
        expect(rectangle.parent).toBe(parent)
        expect(parent.children).toContain(rectangle)
    })

})
