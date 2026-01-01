import {describe, test, expect, beforeEach} from 'vitest'
import CanvasRectangleRenderer from './canvas_rectangle_renderer.js'
import CanvasObjectRenderer from './canvas_object_renderer.js'
import Rectangle from '../rectangle.js'


describe('CanvasRectangleRenderer', () => {

    let renderer
    let ctx


    beforeEach(() => {
        renderer = new CanvasRectangleRenderer()
        ctx = {
            fillRect: () => {},
            strokeRect: () => {},
            fillStyle: null,
            strokeStyle: null,
            lineWidth: 0
        }
    })


    test('extends CanvasObjectRenderer', () => {
        expect(renderer).toBeInstanceOf(CanvasObjectRenderer)
    })


    test('handles returns Rectangle', () => {
        expect(CanvasRectangleRenderer.handles).toEqual([Rectangle])
    })


    describe('render', () => {

        test('fills rectangle with color', () => {
            let fillRectArgs = null
            ctx.fillRect = (...args) => { fillRectArgs = args }

            const rect = {
                width: 100,
                height: 50,
                anchorX: 0,
                anchorY: 0,
                color: '#ff0000',
                strokeWidth: 0
            }

            renderer.render(rect, ctx)

            expect(ctx.fillStyle).toBe('#ff0000')
            expect(fillRectArgs[0]).toBe(-0)
            expect(fillRectArgs[1]).toBe(-0)
            expect(fillRectArgs[2]).toBe(100)
            expect(fillRectArgs[3]).toBe(50)
        })


        test('applies anchor offset', () => {
            let fillRectArgs = null
            ctx.fillRect = (...args) => { fillRectArgs = args }

            const rect = {
                width: 100,
                height: 100,
                anchorX: 0.5,
                anchorY: 0.5,
                color: '#ff0000',
                strokeWidth: 0
            }

            renderer.render(rect, ctx)

            expect(fillRectArgs[0]).toBe(-50)
            expect(fillRectArgs[1]).toBe(-50)
        })


        test('does not fill when color is transparent', () => {
            let filled = false
            ctx.fillRect = () => { filled = true }

            const rect = {
                width: 100,
                height: 50,
                anchorX: 0,
                anchorY: 0,
                color: 'transparent',
                strokeWidth: 0
            }

            renderer.render(rect, ctx)

            expect(filled).toBe(false)
        })


        test('does not fill when color is null', () => {
            let filled = false
            ctx.fillRect = () => { filled = true }

            const rect = {
                width: 100,
                height: 50,
                anchorX: 0,
                anchorY: 0,
                color: null,
                strokeWidth: 0
            }

            renderer.render(rect, ctx)

            expect(filled).toBe(false)
        })


        test('draws stroke when strokeWidth > 0', () => {
            let strokeRectArgs = null
            ctx.strokeRect = (...args) => { strokeRectArgs = args }

            const rect = {
                width: 100,
                height: 50,
                anchorX: 0,
                anchorY: 0,
                color: '#ff0000',
                strokeWidth: 2,
                strokeColor: '#000000'
            }

            renderer.render(rect, ctx)

            expect(ctx.strokeStyle).toBe('#000000')
            expect(ctx.lineWidth).toBe(2)
            expect(strokeRectArgs[0]).toBe(-0)
            expect(strokeRectArgs[1]).toBe(-0)
            expect(strokeRectArgs[2]).toBe(100)
            expect(strokeRectArgs[3]).toBe(50)
        })


        test('does not stroke when strokeWidth is 0', () => {
            let stroked = false
            ctx.strokeRect = () => { stroked = true }

            const rect = {
                width: 100,
                height: 50,
                anchorX: 0,
                anchorY: 0,
                color: '#ff0000',
                strokeWidth: 0
            }

            renderer.render(rect, ctx)

            expect(stroked).toBe(false)
        })


        test('can draw stroke-only rectangle', () => {
            let filled = false
            let stroked = false
            ctx.fillRect = () => { filled = true }
            ctx.strokeRect = () => { stroked = true }

            const rect = {
                width: 100,
                height: 50,
                anchorX: 0,
                anchorY: 0,
                color: 'transparent',
                strokeWidth: 3,
                strokeColor: '#0000ff'
            }

            renderer.render(rect, ctx)

            expect(filled).toBe(false)
            expect(stroked).toBe(true)
        })

    })

})
