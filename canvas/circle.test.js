import Circle from './circle'
import Object2D from './object_2d'
import {beforeEach, describe, test, expect} from 'vitest'


describe(Circle, () => {
    let circle

    beforeEach(() => {
        circle = new Circle()
    })


    test('constructor with default options', () => {
        expect(circle).toBeInstanceOf(Object2D)
        expect(circle.userData.radius).toBe(50)
        expect(circle.userData.color).toBe('#ff4444')
        expect(circle.userData.strokeColor).toBe('#333333')
        expect(circle.userData.strokeWidth).toBe(2)
        expect(circle.userData.renderType).toBe('circle')
    })


    test('constructor with custom options', () => {
        const customCircle = new Circle({
            x: 100,
            y: 200,
            radius: 75,
            color: '#00ff00',
            strokeColor: '#0000ff',
            strokeWidth: 5,
            opacity: 0.8
        })

        expect(customCircle.position.x).toBe(100)
        expect(customCircle.position.y).toBe(200)
        expect(customCircle.userData.radius).toBe(75)
        expect(customCircle.userData.color).toBe('#00ff00')
        expect(customCircle.userData.strokeColor).toBe('#0000ff')
        expect(customCircle.userData.strokeWidth).toBe(5)
        expect(customCircle.userData.opacity).toBe(0.8)
    })


    test('setRadius', () => {
        const result = circle.setRadius(100)
        
        expect(circle.userData.radius).toBe(100)
        expect(result).toBe(circle)
    })


    test('setColor', () => {
        const result = circle.setColor('#123456')
        
        expect(circle.userData.color).toBe('#123456')
        expect(result).toBe(circle)
    })


    test('inherited methods from Object2D', () => {
        circle.setPosition(50, 75)
        circle.setRotation(Math.PI / 3)
        circle.setScale(2)
        circle.setOpacity(0.5)

        expect(circle.position.x).toBe(50)
        expect(circle.position.y).toBe(75)
        expect(circle.rotation.z).toBe(Math.PI / 3)
        expect(circle.scale.x).toBe(2)
        expect(circle.scale.y).toBe(2)
        expect(circle.userData.opacity).toBe(0.5)
    })


    test('renderType is properly set', () => {
        expect(circle.userData.renderType).toBe('circle')
    })


    test('can be added to parent', () => {
        const parent = new Object2D()
        parent.add(circle)
        
        expect(circle.parent).toBe(parent)
        expect(parent.children).toContain(circle)
    })

})
