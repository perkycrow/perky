import {describe, test, expect, beforeEach, vi} from 'vitest'
import Image2D from './image_2d.js'
import TextureRegion from './textures/texture_region.js'
import CanvasImageRenderer from './canvas/canvas_image_renderer.js'


describe(Image2D, () => {

    let image2d

    beforeEach(() => {
        image2d = new Image2D()
    })


    test('constructor defaults', () => {
        expect(image2d.image).toBe(null)
        expect(image2d.region).toBe(null)
        expect(image2d.width).toBe(10)
        expect(image2d.height).toBe(10)
    })


    test('constructor with image option', () => {
        const img = {complete: true, width: 200, height: 100}
        const i = new Image2D({
            x: 10,
            y: 20,
            image: img,
            width: 100,
            height: 50,
            opacity: 0.5,
            rotation: Math.PI / 4
        })

        expect(i.x).toBe(10)
        expect(i.y).toBe(20)
        expect(i.image).toBe(img)
        expect(i.region).toBeInstanceOf(TextureRegion)
        expect(i.width).toBe(100)
        expect(i.height).toBe(50)
        expect(i.opacity).toBe(0.5)
        expect(i.rotation).toBeCloseTo(Math.PI / 4)
    })


    test('constructor with region option', () => {
        const img = {width: 256, height: 256}
        const region = new TextureRegion({
            image: img,
            x: 32,
            y: 64,
            width: 48,
            height: 32
        })

        const i = new Image2D({region, width: 100, height: 50})

        expect(i.region).toBe(region)
        expect(i.image).toBe(img)
    })


    test('image setter creates region', () => {
        const img = {width: 100, height: 100}
        image2d.image = img

        expect(image2d.image).toBe(img)
        expect(image2d.region).toBeInstanceOf(TextureRegion)
    })


    test('image setter with null clears region', () => {
        const img = {width: 100, height: 100}
        image2d.image = img
        image2d.image = null

        expect(image2d.image).toBe(null)
        expect(image2d.region).toBe(null)
    })


    test('getBounds', () => {
        image2d.width = 100
        image2d.height = 50
        image2d.anchorX = 0.5
        image2d.anchorY = 0.5

        const bounds = image2d.getBounds()

        expect(bounds.minX).toBe(-50)
        expect(bounds.minY).toBe(-25)
        expect(bounds.maxX).toBe(50)
        expect(bounds.maxY).toBe(25)
        expect(bounds.width).toBe(100)
        expect(bounds.height).toBe(50)
    })

})


describe(CanvasImageRenderer, () => {

    let renderer
    let ctx

    beforeEach(() => {
        renderer = new CanvasImageRenderer()
        ctx = {
            save: vi.fn(),
            scale: vi.fn(),
            drawImage: vi.fn(),
            restore: vi.fn()
        }
    })


    test('handles Image2D class', () => {
        expect(CanvasImageRenderer.handles).toContain(Image2D)
    })


    test('render does nothing when image is null', () => {
        const image2d = new Image2D({image: null})

        renderer.render(image2d, ctx)

        expect(ctx.drawImage).not.toHaveBeenCalled()
    })


    test('render does nothing when image is not complete', () => {
        const image2d = new Image2D({image: {complete: false, width: 100, height: 100}})

        renderer.render(image2d, ctx)

        expect(ctx.drawImage).not.toHaveBeenCalled()
    })


    test('render draws image when complete', () => {
        const img = {complete: true, width: 200, height: 100}
        const image2d = new Image2D({
            image: img,
            width: 100,
            height: 50,
            anchorX: 0.5,
            anchorY: 0.5
        })

        renderer.render(image2d, ctx)

        expect(ctx.save).toHaveBeenCalled()
        expect(ctx.scale).toHaveBeenCalledWith(1, -1)
        expect(ctx.drawImage).toHaveBeenCalledWith(
            img,
            0, 0, 200, 100,
            -50, -25,
            100, 50
        )
        expect(ctx.restore).toHaveBeenCalled()
    })


    test('render with custom anchor', () => {
        const img = {complete: true, width: 200, height: 100}
        const image2d = new Image2D({
            image: img,
            width: 100,
            height: 50,
            anchorX: 0,
            anchorY: 0
        })

        renderer.render(image2d, ctx)

        expect(ctx.drawImage).toHaveBeenCalled()
        const call = ctx.drawImage.mock.calls[0]
        expect(call[0]).toBe(img)
        expect(call[5]).toBeCloseTo(0)
        expect(call[6]).toBeCloseTo(-50)
        expect(call[7]).toBe(100)
        expect(call[8]).toBe(50)
    })


    test('render with bottom-right anchor', () => {
        const img = {complete: true, width: 200, height: 100}
        const image2d = new Image2D({
            image: img,
            width: 100,
            height: 50,
            anchorX: 1,
            anchorY: 1
        })

        renderer.render(image2d, ctx)

        expect(ctx.drawImage).toHaveBeenCalled()
        const call = ctx.drawImage.mock.calls[0]
        expect(call[0]).toBe(img)
        expect(call[5]).toBeCloseTo(-100)
        expect(call[6]).toBeCloseTo(0)
        expect(call[7]).toBe(100)
        expect(call[8]).toBe(50)
    })

})
