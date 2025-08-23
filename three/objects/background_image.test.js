import BackgroundImage from './background_image'
import {OrthographicCamera, PerspectiveCamera} from 'three'


describe('BackgroundImage', () => {

    test('constructor creates basic background image', () => {
        const backgroundImage = new BackgroundImage()

        expect(backgroundImage).toBeInstanceOf(BackgroundImage)
        expect(backgroundImage.material).toBeDefined()
    })


    test('constructor with image source', () => {
        const mockImage = document.createElement('canvas')
        mockImage.width = 800
        mockImage.height = 600
        
        const backgroundImage = new BackgroundImage({
            source: mockImage
        })

        expect(backgroundImage.image).toBe(mockImage)
    })


    test('resize with orthographic camera scales image correctly', () => {
        const mockImage = document.createElement('canvas')
        mockImage.width = 800
        mockImage.height = 600
        
        const backgroundImage = new BackgroundImage({
            source: mockImage
        })

        const camera = new OrthographicCamera(-10, 10, 10, -10)
        const containerSize = {width: 1024, height: 768}

        backgroundImage.resize(containerSize, camera)

        const expectedViewHeight = camera.top - camera.bottom
        const expectedViewWidth = expectedViewHeight * (containerSize.width / containerSize.height)
        const imageAspect = mockImage.width / mockImage.height
        const containerAspect = containerSize.width / containerSize.height

        let expectedScaleX
        let expectedScaleY
        if (containerAspect > imageAspect) {
            expectedScaleX = expectedViewWidth / mockImage.width
            expectedScaleY = expectedScaleX
        } else {
            expectedScaleY = expectedViewHeight / mockImage.height
            expectedScaleX = expectedScaleY
        }

        expect(backgroundImage.scale.x).toBeCloseTo(expectedScaleX * mockImage.width)
        expect(backgroundImage.scale.y).toBeCloseTo(expectedScaleY * mockImage.height)
        expect(backgroundImage.scale.z).toBe(1)
    })


    test('resize with perspective camera does nothing', () => {
        const mockImage = document.createElement('canvas')
        mockImage.width = 800
        mockImage.height = 600
        
        const backgroundImage = new BackgroundImage({
            source: mockImage
        })

        const camera = new PerspectiveCamera(75, 16 / 9, 0.1, 1000)
        const containerSize = {width: 1024, height: 768}

        const originalScale = backgroundImage.scale.clone()
        
        backgroundImage.resize(containerSize, camera)

        expect(backgroundImage.scale.x).toBe(originalScale.x)
        expect(backgroundImage.scale.y).toBe(originalScale.y)
        expect(backgroundImage.scale.z).toBe(originalScale.z)
    })


    test('resize without image does nothing', () => {
        const backgroundImage = new BackgroundImage()
        const camera = new OrthographicCamera(-10, 10, 10, -10)
        const containerSize = {width: 1024, height: 768}

        const originalScale = backgroundImage.scale.clone()

        backgroundImage.resize(containerSize, camera)

        expect(backgroundImage.scale.x).toBe(originalScale.x)
        expect(backgroundImage.scale.y).toBe(originalScale.y)
        expect(backgroundImage.scale.z).toBe(originalScale.z)
    })


    test('resize handles different container aspect ratios correctly', () => {
        const mockImage = document.createElement('canvas')
        mockImage.width = 400
        mockImage.height = 300
        
        const backgroundImage = new BackgroundImage({
            source: mockImage
        })

        const camera = new OrthographicCamera(-5, 5, 5, -5)

        const wideContainer = {width: 1600, height: 800}
        backgroundImage.resize(wideContainer, camera)
        
        const wideScaleX = backgroundImage.scale.x
        const wideScaleY = backgroundImage.scale.y

        const tallContainer = {width: 800, height: 1600}
        backgroundImage.resize(tallContainer, camera)
        
        const tallScaleX = backgroundImage.scale.x
        const tallScaleY = backgroundImage.scale.y

        expect(wideScaleX).not.toBe(tallScaleX)
        expect(wideScaleY).not.toBe(tallScaleY)
    })


    test('resize maintains image aspect ratio', () => {
        const mockImage = document.createElement('canvas')
        mockImage.width = 400
        mockImage.height = 300
        
        const backgroundImage = new BackgroundImage({
            source: mockImage
        })

        const camera = new OrthographicCamera(-8, 8, 6, -6)
        const containerSize = {width: 1280, height: 960}

        backgroundImage.resize(containerSize, camera)

        const scaleRatio = backgroundImage.scale.x / backgroundImage.scale.y
        const imageAspect = mockImage.width / mockImage.height

        expect(scaleRatio).toBeCloseTo(imageAspect, 5)
    })

})
