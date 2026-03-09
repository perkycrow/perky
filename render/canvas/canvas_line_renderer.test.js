import {describe, test, expect, beforeEach} from 'vitest'
import CanvasLineRenderer from './canvas_line_renderer.js'
import CanvasObjectRenderer from './canvas_object_renderer.js'
import Line from '../line.js'


describe('CanvasLineRenderer', () => {

    let renderer
    let ctx


    beforeEach(() => {
        renderer = new CanvasLineRenderer()
        ctx = {
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            stroke: () => {},
            strokeStyle: null,
            lineWidth: 0
        }
    })


    test('extends CanvasObjectRenderer', () => {
        expect(renderer).toBeInstanceOf(CanvasObjectRenderer)
    })


    test('handles returns Line', () => {
        expect(CanvasLineRenderer.handles).toEqual([Line])
    })


    describe('render', () => {

        test('draws line from origin to x2/y2', () => {
            let moveToArgs = null
            let lineToArgs = null
            ctx.moveTo = (...args) => {
                moveToArgs = args
            }
            ctx.lineTo = (...args) => {
                lineToArgs = args
            }

            const line = {x2: 100, y2: 50, color: '#ff0000', lineWidth: 2}

            renderer.render(line, ctx)

            expect(moveToArgs).toEqual([0, 0])
            expect(lineToArgs).toEqual([100, 50])
        })


        test('sets stroke color', () => {
            const line = {x2: 10, y2: 20, color: '#00ff00', lineWidth: 1}

            renderer.render(line, ctx)

            expect(ctx.strokeStyle).toBe('#00ff00')
        })


        test('sets line width', () => {
            const line = {x2: 10, y2: 20, color: '#000000', lineWidth: 3}

            renderer.render(line, ctx)

            expect(ctx.lineWidth).toBe(3)
        })


        test('calls stroke', () => {
            let stroked = false
            ctx.stroke = () => {
                stroked = true
            }

            const line = {x2: 10, y2: 20, color: '#000000', lineWidth: 1}

            renderer.render(line, ctx)

            expect(stroked).toBe(true)
        })

    })

})
