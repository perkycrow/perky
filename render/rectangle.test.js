import {describe, test, expect, beforeEach, vi} from 'vitest'
import Rectangle from './rectangle'
import CanvasRectangleRenderer from './canvas/canvas_rectangle_renderer'


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


    test('getBounds', () => {
        rectangle.width = 100
        rectangle.height = 50
        rectangle.anchorX = 0.5
        rectangle.anchorY = 0.5

        const bounds = rectangle.getBounds()

        expect(bounds.minX).toBe(-50)
        expect(bounds.minY).toBe(-25)
        expect(bounds.maxX).toBe(50)
        expect(bounds.maxY).toBe(25)
        expect(bounds.width).toBe(100)
        expect(bounds.height).toBe(50)
    })

})


describe(CanvasRectangleRenderer, () => {

    let renderer
    let ctx

    beforeEach(() => {
        renderer = new CanvasRectangleRenderer()
        ctx = {
            fillRect: vi.fn(),
            strokeRect: vi.fn()
        }
    })


    test('handles Rectangle class', () => {
        expect(CanvasRectangleRenderer.handles).toContain(Rectangle)
    })


    test('render without stroke', () => {
        const rect = new Rectangle({
            width: 100,
            height: 50,
            color: '#ff0000',
            anchorX: 0.5,
            anchorY: 0.5,
            strokeWidth: 0
        })

        renderer.render(rect, ctx)

        expect(ctx.fillRect).toHaveBeenCalledWith(-50, -25, 100, 50)
        expect(ctx.strokeRect).not.toHaveBeenCalled()
    })


    test('render with stroke', () => {
        const rect = new Rectangle({
            width: 100,
            height: 50,
            color: '#ff0000',
            strokeColor: '#0000ff',
            strokeWidth: 2,
            anchorX: 0.5,
            anchorY: 0.5
        })

        renderer.render(rect, ctx)

        expect(ctx.fillRect).toHaveBeenCalledWith(-50, -25, 100, 50)
        expect(ctx.strokeRect).toHaveBeenCalledWith(-50, -25, 100, 50)
    })


    test('render with custom anchor', () => {
        const rect = new Rectangle({
            width: 100,
            height: 50,
            anchorX: 0,
            anchorY: 0
        })

        renderer.render(rect, ctx)

        expect(ctx.fillRect).toHaveBeenCalledWith(-0, -0, 100, 50)
    })


    test('render with top-left anchor', () => {
        const rect = new Rectangle({
            width: 100,
            height: 50,
            anchorX: 1,
            anchorY: 1
        })

        renderer.render(rect, ctx)

        expect(ctx.fillRect).toHaveBeenCalledWith(-100, -50, 100, 50)
    })

})
