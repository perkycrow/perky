import {describe, test, expect, beforeEach, vi} from 'vitest'
import Line from './line.js'
import CanvasLineRenderer from './canvas/canvas_line_renderer.js'


describe(Line, () => {

    let line

    beforeEach(() => {
        line = new Line()
    })


    test('constructor defaults', () => {
        expect(line.x2).toBe(0)
        expect(line.y2).toBe(0)
        expect(line.color).toBe('#000000')
        expect(line.lineWidth).toBe(1)
    })


    test('constructor with options', () => {
        const l = new Line({
            x: 10,
            y: 20,
            x2: 30,
            y2: 40,
            color: '#ff0000',
            lineWidth: 3,
            opacity: 0.5
        })

        expect(l.x).toBe(10)
        expect(l.y).toBe(20)
        expect(l.x2).toBe(30)
        expect(l.y2).toBe(40)
        expect(l.color).toBe('#ff0000')
        expect(l.lineWidth).toBe(3)
        expect(l.opacity).toBe(0.5)
    })


    test('getBounds', () => {
        line.x2 = 100
        line.y2 = -50

        const bounds = line.getBounds()

        expect(bounds.minX).toBe(0)
        expect(bounds.minY).toBe(-50)
        expect(bounds.maxX).toBe(100)
        expect(bounds.maxY).toBe(0)
        expect(bounds.width).toBe(100)
        expect(bounds.height).toBe(50)
    })


    test('getBounds with negative x2', () => {
        line.x2 = -30
        line.y2 = 20

        const bounds = line.getBounds()

        expect(bounds.minX).toBe(-30)
        expect(bounds.minY).toBe(0)
        expect(bounds.maxX).toBe(0)
        expect(bounds.maxY).toBe(20)
        expect(bounds.width).toBe(30)
        expect(bounds.height).toBe(20)
    })

})


describe(CanvasLineRenderer, () => {

    let renderer
    let ctx

    beforeEach(() => {
        renderer = new CanvasLineRenderer()
        ctx = {
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn()
        }
    })


    test('handles Line class', () => {
        expect(CanvasLineRenderer.handles).toContain(Line)
    })


    test('render', () => {
        const line = new Line({
            x2: 50,
            y2: 30,
            color: '#ff0000',
            lineWidth: 2
        })

        renderer.render(line, ctx)

        expect(ctx.beginPath).toHaveBeenCalled()
        expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
        expect(ctx.lineTo).toHaveBeenCalledWith(50, 30)
        expect(ctx.strokeStyle).toBe('#ff0000')
        expect(ctx.lineWidth).toBe(2)
        expect(ctx.stroke).toHaveBeenCalled()
    })

})
