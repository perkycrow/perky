import {describe, test, expect, beforeEach, vi} from 'vitest'
import Image2D from './image_2d'


describe(Image2D, () => {

    let image2d

    beforeEach(() => {
        image2d = new Image2D()
    })


    test('constructor defaults', () => {
        expect(image2d.image).toBe(null)
        expect(image2d.width).toBe(10)
        expect(image2d.height).toBe(10)
    })


    test('constructor with options', () => {
        const img = { complete: true }
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
        expect(i.width).toBe(100)
        expect(i.height).toBe(50)
        expect(i.opacity).toBe(0.5)
        expect(i.rotation).toBeCloseTo(Math.PI / 4)
    })


    test('render does nothing when image is null', () => {
        const ctx = {
            drawImage: vi.fn()
        }

        image2d.image = null
        image2d.render(ctx)

        expect(ctx.drawImage).not.toHaveBeenCalled()
    })


    test('render does nothing when image is not complete', () => {
        const ctx = {
            drawImage: vi.fn()
        }

        image2d.image = { complete: false }
        image2d.render(ctx)

        expect(ctx.drawImage).not.toHaveBeenCalled()
    })


    test('render draws image when complete', () => {
        const ctx = {
            save: vi.fn(),
            scale: vi.fn(),
            drawImage: vi.fn(),
            restore: vi.fn()
        }

        const img = { complete: true }
        image2d.image = img
        image2d.width = 100
        image2d.height = 50
        image2d.anchorX = 0.5
        image2d.anchorY = 0.5

        image2d.render(ctx)

        expect(ctx.save).toHaveBeenCalled()
        expect(ctx.scale).toHaveBeenCalledWith(1, -1)
        expect(ctx.drawImage).toHaveBeenCalledWith(img, -50, -25, 100, 50)
        expect(ctx.restore).toHaveBeenCalled()
    })


    test('render with custom anchor', () => {
        const ctx = {
            save: vi.fn(),
            scale: vi.fn(),
            drawImage: vi.fn(),
            restore: vi.fn()
        }

        const img = { complete: true }
        image2d.image = img
        image2d.width = 100
        image2d.height = 50
        image2d.anchorX = 0
        image2d.anchorY = 0

        image2d.render(ctx)

        expect(ctx.save).toHaveBeenCalled()
        expect(ctx.scale).toHaveBeenCalledWith(1, -1)
        expect(ctx.drawImage).toHaveBeenCalledWith(img, -0, -50, 100, 50)
        expect(ctx.restore).toHaveBeenCalled()
    })


    test('render with bottom-right anchor', () => {
        const ctx = {
            save: vi.fn(),
            scale: vi.fn(),
            drawImage: vi.fn(),
            restore: vi.fn()
        }

        const img = { complete: true }
        image2d.image = img
        image2d.width = 100
        image2d.height = 50
        image2d.anchorX = 1
        image2d.anchorY = 1

        image2d.render(ctx)

        expect(ctx.save).toHaveBeenCalled()
        expect(ctx.scale).toHaveBeenCalledWith(1, -1)
        expect(ctx.drawImage).toHaveBeenCalledWith(img, -100, 0, 100, 50)
        expect(ctx.restore).toHaveBeenCalled()
    })

})
