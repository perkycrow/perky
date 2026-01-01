import {describe, test, expect, beforeEach} from 'vitest'
import CanvasCircleRenderer from './canvas_circle_renderer.js'
import CanvasObjectRenderer from './canvas_object_renderer.js'
import Circle from '../circle.js'


describe('CanvasCircleRenderer', () => {

    let renderer
    let ctx


    beforeEach(() => {
        renderer = new CanvasCircleRenderer()
        ctx = {
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            fillStyle: null,
            strokeStyle: null,
            lineWidth: 0
        }
    })


    test('extends CanvasObjectRenderer', () => {
        expect(renderer).toBeInstanceOf(CanvasObjectRenderer)
    })


    test('handles returns Circle', () => {
        expect(CanvasCircleRenderer.handles).toEqual([Circle])
    })


    describe('render', () => {

        test('draws circle with correct offset for default anchor', () => {
            let arcArgs = null
            ctx.arc = (...args) => { arcArgs = args }

            const circle = {
                radius: 50,
                anchorX: 0.5,
                anchorY: 0.5,
                color: '#ff0000',
                strokeWidth: 0
            }

            renderer.render(circle, ctx)

            expect(arcArgs[0]).toBe(0)
            expect(arcArgs[1]).toBe(0)
            expect(arcArgs[2]).toBe(50)
            expect(arcArgs[3]).toBe(0)
            expect(arcArgs[4]).toBe(Math.PI * 2)
        })


        test('draws circle with correct offset for top-left anchor', () => {
            let arcArgs = null
            ctx.arc = (...args) => { arcArgs = args }

            const circle = {
                radius: 50,
                anchorX: 0,
                anchorY: 0,
                color: '#ff0000',
                strokeWidth: 0
            }

            renderer.render(circle, ctx)

            expect(arcArgs[0]).toBe(50)
            expect(arcArgs[1]).toBe(50)
        })


        test('sets fill color', () => {
            const circle = {
                radius: 30,
                anchorX: 0.5,
                anchorY: 0.5,
                color: '#00ff00',
                strokeWidth: 0
            }

            renderer.render(circle, ctx)

            expect(ctx.fillStyle).toBe('#00ff00')
        })


        test('draws stroke when strokeWidth > 0', () => {
            let stroked = false
            ctx.stroke = () => { stroked = true }

            const circle = {
                radius: 40,
                anchorX: 0.5,
                anchorY: 0.5,
                color: '#ff0000',
                strokeWidth: 2,
                strokeColor: '#000000'
            }

            renderer.render(circle, ctx)

            expect(stroked).toBe(true)
            expect(ctx.strokeStyle).toBe('#000000')
            expect(ctx.lineWidth).toBe(2)
        })


        test('does not draw stroke when strokeWidth is 0', () => {
            let stroked = false
            ctx.stroke = () => { stroked = true }

            const circle = {
                radius: 40,
                anchorX: 0.5,
                anchorY: 0.5,
                color: '#ff0000',
                strokeWidth: 0
            }

            renderer.render(circle, ctx)

            expect(stroked).toBe(false)
        })

    })

})
