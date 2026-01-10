import {describe, test, expect} from 'vitest'
import TextureRegion from './texture_region.js'


function createMockImage (width = 256, height = 256) {
    return {width, height}
}


describe('TextureRegion', () => {

    describe('constructor', () => {

        test('default values', () => {
            const region = new TextureRegion()

            expect(region.image).toBe(null)
            expect(region.x).toBe(0)
            expect(region.y).toBe(0)
            expect(region.width).toBe(0)
            expect(region.height).toBe(0)
        })


        test('derives dimensions from image', () => {
            const image = createMockImage(128, 64)
            const region = new TextureRegion({image})

            expect(region.image).toBe(image)
            expect(region.width).toBe(128)
            expect(region.height).toBe(64)
        })


        test('accepts explicit dimensions', () => {
            const image = createMockImage(256, 256)
            const region = new TextureRegion({
                image,
                x: 32,
                y: 64,
                width: 48,
                height: 32
            })

            expect(region.x).toBe(32)
            expect(region.y).toBe(64)
            expect(region.width).toBe(48)
            expect(region.height).toBe(32)
        })

    })


    describe('UV coordinates', () => {

        test('full image UVs', () => {
            const image = createMockImage(256, 256)
            const region = new TextureRegion({image})

            expect(region.u0).toBe(0)
            expect(region.v0).toBe(0)
            expect(region.u1).toBe(1)
            expect(region.v1).toBe(1)
        })


        test('sub-region UVs', () => {
            const image = createMockImage(256, 256)
            const region = new TextureRegion({
                image,
                x: 64,
                y: 128,
                width: 64,
                height: 64
            })

            expect(region.u0).toBe(0.25)
            expect(region.v0).toBe(0.5)
            expect(region.u1).toBe(0.5)
            expect(region.v1).toBe(0.75)
        })


        test('default UVs when no image', () => {
            const region = new TextureRegion()

            expect(region.u0).toBe(0)
            expect(region.v0).toBe(0)
            expect(region.u1).toBe(1)
            expect(region.v1).toBe(1)
        })


        test('uvs getter', () => {
            const image = createMockImage(100, 100)
            const region = new TextureRegion({
                image,
                x: 10,
                y: 20,
                width: 30,
                height: 40
            })

            const uvs = region.uvs

            expect(uvs.u0).toBe(0.1)
            expect(uvs.v0).toBe(0.2)
            expect(uvs.u1).toBe(0.4)
            expect(uvs.v1).toBe(0.6)
        })

    })


    test('bounds returns bounds object', () => {
        const image = createMockImage(256, 256)
        const region = new TextureRegion({
            image,
            x: 10,
            y: 20,
            width: 30,
            height: 40
        })

        const bounds = region.bounds

        expect(bounds.x).toBe(10)
        expect(bounds.y).toBe(20)
        expect(bounds.width).toBe(30)
        expect(bounds.height).toBe(40)
    })


    describe('valid', () => {

        test('invalid without image', () => {
            const region = new TextureRegion({width: 10, height: 10})
            expect(region.valid).toBe(false)
        })


        test('invalid with zero dimensions', () => {
            const image = createMockImage()
            const region = new TextureRegion({image, width: 0, height: 10})
            expect(region.valid).toBe(false)
        })


        test('valid with image and dimensions', () => {
            const image = createMockImage()
            const region = new TextureRegion({image, width: 10, height: 10})
            expect(region.valid).toBe(true)
        })

    })


    describe('fromImage', () => {

        test('creates region covering full image', () => {
            const image = createMockImage(200, 100)
            const region = TextureRegion.fromImage(image)

            expect(region.image).toBe(image)
            expect(region.x).toBe(0)
            expect(region.y).toBe(0)
            expect(region.width).toBe(200)
            expect(region.height).toBe(100)
        })


        test('handles null image', () => {
            const region = TextureRegion.fromImage(null)

            expect(region.image).toBe(null)
            expect(region.width).toBe(0)
            expect(region.height).toBe(0)
        })

    })


    describe('fromFrame', () => {

        test('creates region from frame with w/h', () => {
            const image = createMockImage(512, 512)
            const frame = {x: 100, y: 200, w: 50, h: 60}
            const region = TextureRegion.fromFrame(image, frame)

            expect(region.image).toBe(image)
            expect(region.x).toBe(100)
            expect(region.y).toBe(200)
            expect(region.width).toBe(50)
            expect(region.height).toBe(60)
        })


        test('creates region from frame with width/height', () => {
            const image = createMockImage(512, 512)
            const frame = {x: 10, y: 20, width: 30, height: 40}
            const region = TextureRegion.fromFrame(image, frame)

            expect(region.width).toBe(30)
            expect(region.height).toBe(40)
        })

    })

})
