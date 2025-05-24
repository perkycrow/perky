import Group2D from './group_2d'
import Object2D from './object_2d'
import Circle from './circle'
import Rectangle from './rectangle'
import {beforeEach, describe, test, expect} from 'vitest'


describe(Group2D, () => {
    let group

    beforeEach(() => {
        group = new Group2D()
    })


    test('constructor with default options', () => {
        expect(group).toBeInstanceOf(Object2D)
        expect(group.userData.renderType).toBeNull()
    })


    test('constructor with custom options', () => {
        const customGroup = new Group2D({
            x: 100,
            y: 200,
            rotation: Math.PI / 2,
            opacity: 0.5
        })

        expect(customGroup.position.x).toBe(100)
        expect(customGroup.position.y).toBe(200)
        expect(customGroup.rotation.z).toBe(Math.PI / 2)
        expect(customGroup.userData.opacity).toBe(0.5)
        expect(customGroup.userData.renderType).toBeNull()
    })


    test('addChild with single object', () => {
        const circle = new Circle()
        const result = group.addChild(circle)
        
        expect(group.children).toContain(circle)
        expect(circle.parent).toBe(group)
        expect(result).toBe(group)
    })


    test('addChild with multiple objects', () => {
        const circle = new Circle()
        const rectangle = new Rectangle()
        const subGroup = new Group2D()
        
        const result = group.addChild(circle, rectangle, subGroup)
        
        expect(group.children.length).toBe(3)
        expect(group.children).toContain(circle)
        expect(group.children).toContain(rectangle)
        expect(group.children).toContain(subGroup)
        expect(circle.parent).toBe(group)
        expect(rectangle.parent).toBe(group)
        expect(subGroup.parent).toBe(group)
        expect(result).toBe(group)
    })


    test('renderType is null for groups', () => {
        expect(group.userData.renderType).toBeNull()
    })


    test('inherited methods from Object2D', () => {
        group.setPosition(50, 100)
        group.setRotation(Math.PI / 3)
        group.setScale(2, 3)
        group.setOpacity(0.7)

        expect(group.position.x).toBe(50)
        expect(group.position.y).toBe(100)
        expect(group.rotation.z).toBe(Math.PI / 3)
        expect(group.scale.x).toBe(2)
        expect(group.scale.y).toBe(3)
        expect(group.userData.opacity).toBe(0.7)
    })


    test('nested groups', () => {
        const childGroup = new Group2D()
        const circle = new Circle()
        
        childGroup.addChild(circle)
        group.addChild(childGroup)
        
        expect(group.children).toContain(childGroup)
        expect(childGroup.children).toContain(circle)
        expect(childGroup.parent).toBe(group)
        expect(circle.parent).toBe(childGroup)
    })


    test('group transformations affect children', () => {
        const circle = new Circle({x: 100, y: 0})
        group.addChild(circle)
        
        group.setPosition(50, 50)
        group.updateMatrixWorld(true)
        
        const worldPosition = circle.getWorldPosition(circle.position.clone())
        expect(worldPosition.x).toBe(150)
        expect(worldPosition.y).toBe(50)
    })

})
