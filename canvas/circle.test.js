import {describe, test, expect, beforeEach, vi} from 'vitest'
import Circle from './circle'


describe(Circle, () => {

    let circle

    beforeEach(() => {
        circle = new Circle()
    })


    test('constructor defaults', () => {
        expect(circle.radius).toBe(10)
        expect(circle.color).toBe('#000000')
        expect(circle.strokeColor).toBe('#000000')
        expect(circle.strokeWidth).toBe(0)
    })


    test('constructor with options', () => {
        const c = new Circle({
            x: 10,
            y: 20,
            radius: 50,
            color: '#ff0000',
            strokeColor: '#00ff00',
            strokeWidth: 2,
            opacity: 0.5
        })

        expect(c.x).toBe(10)
        expect(c.y).toBe(20)
        expect(c.radius).toBe(50)
        expect(c.color).toBe('#ff0000')
        expect(c.strokeColor).toBe('#00ff00')
        expect(c.strokeWidth).toBe(2)
        expect(c.opacity).toBe(0.5)
    })


    test('setRadius', () => {
        const result = circle.setRadius(25)

        expect(circle.radius).toBe(25)
        expect(result).toBe(circle)
    })


    test('render without stroke', () => {
        const ctx = {
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn()
        }

        circle.radius = 20
        circle.color = '#ff0000'
        circle.anchorX = 0.5
        circle.anchorY = 0.5
        circle.strokeWidth = 0

        circle.render(ctx)

        expect(ctx.beginPath).toHaveBeenCalled()
        expect(ctx.arc).toHaveBeenCalledWith(0, 0, 20, 0, Math.PI * 2)
        expect(ctx.fill).toHaveBeenCalled()
        expect(ctx.stroke).not.toHaveBeenCalled()
    })


    test('render with stroke', () => {
        const ctx = {
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn()
        }

        circle.radius = 20
        circle.color = '#ff0000'
        circle.strokeColor = '#0000ff'
        circle.strokeWidth = 2
        circle.anchorX = 0.5
        circle.anchorY = 0.5

        circle.render(ctx)

        expect(ctx.beginPath).toHaveBeenCalled()
        expect(ctx.arc).toHaveBeenCalledWith(0, 0, 20, 0, Math.PI * 2)
        expect(ctx.fill).toHaveBeenCalled()
        expect(ctx.stroke).toHaveBeenCalled()
    })


    test('render with custom anchor', () => {
        const ctx = {
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn()
        }

        circle.radius = 20
        circle.anchorX = 0
        circle.anchorY = 0

        circle.render(ctx)

        expect(ctx.arc).toHaveBeenCalledWith(20, 20, 20, 0, Math.PI * 2)
    })

})
