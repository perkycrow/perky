import {describe, test, expect, beforeEach, vi} from 'vitest'
import Rectangle from './rectangle'


describe(Rectangle, () => {

    let rectangle

    beforeEach(() => {
        rectangle = new Rectangle()
    })


    test('constructor defaults', () => {
        expect(rectangle.width).toBe(10)
        expect(rectangle.height).toBe(10)
        expect(rectangle.color).toBe('#000000')
        expect(rectangle.strokeColor).toBe('#000000')
        expect(rectangle.strokeWidth).toBe(0)
    })


    test('constructor with options', () => {
        const r = new Rectangle({
            x: 10,
            y: 20,
            width: 100,
            height: 50,
            color: '#ff0000',
            strokeColor: '#00ff00',
            strokeWidth: 2,
            opacity: 0.5,
            rotation: Math.PI / 4
        })

        expect(r.x).toBe(10)
        expect(r.y).toBe(20)
        expect(r.width).toBe(100)
        expect(r.height).toBe(50)
        expect(r.color).toBe('#ff0000')
        expect(r.strokeColor).toBe('#00ff00')
        expect(r.strokeWidth).toBe(2)
        expect(r.opacity).toBe(0.5)
        expect(r.rotation).toBeCloseTo(Math.PI / 4)
    })


    test('render without stroke', () => {
        const ctx = {
            fillRect: vi.fn(),
            strokeRect: vi.fn()
        }

        rectangle.width = 100
        rectangle.height = 50
        rectangle.color = '#ff0000'
        rectangle.anchorX = 0.5
        rectangle.anchorY = 0.5
        rectangle.strokeWidth = 0

        rectangle.render(ctx)

        expect(ctx.fillRect).toHaveBeenCalledWith(-50, -25, 100, 50)
        expect(ctx.strokeRect).not.toHaveBeenCalled()
    })


    test('render with stroke', () => {
        const ctx = {
            fillRect: vi.fn(),
            strokeRect: vi.fn()
        }

        rectangle.width = 100
        rectangle.height = 50
        rectangle.color = '#ff0000'
        rectangle.strokeColor = '#0000ff'
        rectangle.strokeWidth = 2
        rectangle.anchorX = 0.5
        rectangle.anchorY = 0.5

        rectangle.render(ctx)

        expect(ctx.fillRect).toHaveBeenCalledWith(-50, -25, 100, 50)
        expect(ctx.strokeRect).toHaveBeenCalledWith(-50, -25, 100, 50)
    })


    test('render with custom anchor', () => {
        const ctx = {
            fillRect: vi.fn(),
            strokeRect: vi.fn()
        }

        rectangle.width = 100
        rectangle.height = 50
        rectangle.anchorX = 0
        rectangle.anchorY = 0

        rectangle.render(ctx)

        expect(ctx.fillRect).toHaveBeenCalledWith(-0, -0, 100, 50)
    })


    test('render with top-left anchor', () => {
        const ctx = {
            fillRect: vi.fn(),
            strokeRect: vi.fn()
        }

        rectangle.width = 100
        rectangle.height = 50
        rectangle.anchorX = 1
        rectangle.anchorY = 1

        rectangle.render(ctx)

        expect(ctx.fillRect).toHaveBeenCalledWith(-100, -50, 100, 50)
    })

})
