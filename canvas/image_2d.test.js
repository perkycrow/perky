import Image2D from './image_2d'
import Object2D from './object_2d'
import {beforeEach, describe, test, expect, vi} from 'vitest'


describe(Image2D, () => {
    let image2d
    let mockImage

    beforeEach(() => {
        mockImage = {
            src: '',
            width: 200,
            height: 150,
            complete: true
        }
        
        image2d = new Image2D()
    })


    test('constructor with default options', () => {
        expect(image2d).toBeInstanceOf(Object2D)
        expect(image2d.userData.image).toBeNull()
        expect(image2d.userData.width).toBe(100)
        expect(image2d.userData.height).toBe(100)
        expect(image2d.userData.renderType).toBe('image')
    })


    test('constructor with custom options', () => {
        const customImage2d = new Image2D({
            x: 50,
            y: 100,
            image: mockImage,
            width: 200,
            height: 150,
            rotation: Math.PI / 4,
            opacity: 0.9
        })

        expect(customImage2d.position.x).toBe(50)
        expect(customImage2d.position.y).toBe(100)
        expect(customImage2d.userData.image).toBe(mockImage)
        expect(customImage2d.userData.width).toBe(200)
        expect(customImage2d.userData.height).toBe(150)
        expect(customImage2d.rotation.z).toBe(Math.PI / 4)
        expect(customImage2d.userData.opacity).toBe(0.9)
    })


    test('setImage', () => {
        const result = image2d.setImage(mockImage)
        
        expect(image2d.userData.image).toBe(mockImage)
        expect(result).toBe(image2d)
    })


    test('setSize with two parameters', () => {
        const result = image2d.setSize(300, 200)
        
        expect(image2d.userData.width).toBe(300)
        expect(image2d.userData.height).toBe(200)
        expect(result).toBe(image2d)
    })


    test('setSize with one parameter creates square', () => {
        const result = image2d.setSize(250)
        
        expect(image2d.userData.width).toBe(250)
        expect(image2d.userData.height).toBe(250)
        expect(result).toBe(image2d)
    })


    test('renderType is always image', () => {
        expect(image2d.userData.renderType).toBe('image')
    })


    test('inherited methods from Object2D', () => {
        image2d.setPosition(25, 50)
        image2d.setRotation(Math.PI / 6)
        image2d.setScale(1.5, 2)
        image2d.setOpacity(0.3)

        expect(image2d.position.x).toBe(25)
        expect(image2d.position.y).toBe(50)
        expect(image2d.rotation.z).toBe(Math.PI / 6)
        expect(image2d.scale.x).toBe(1.5)
        expect(image2d.scale.y).toBe(2)
        expect(image2d.userData.opacity).toBe(0.3)
    })


    test('can be added to parent', () => {
        const parent = new Object2D()
        parent.add(image2d)
        
        expect(image2d.parent).toBe(parent)
        expect(parent.children).toContain(image2d)
    })


    test('loading image workflow', () => {
        const img = new Image()
        const loadSpy = vi.fn()
        
        img.addEventListener = vi.fn((event, handler) => {
            if (event === 'load') {
                loadSpy.mockImplementation(handler)
            }
        })
        
        image2d.setImage(img)
        img.src = 'test.png'
        
        expect(image2d.userData.image).toBe(img)
    })

})
