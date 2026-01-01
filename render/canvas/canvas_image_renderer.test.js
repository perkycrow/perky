import {describe, test, expect, beforeEach} from 'vitest'
import CanvasImageRenderer from './canvas_image_renderer.js'
import CanvasObjectRenderer from './canvas_object_renderer.js'
import Image2D from '../image_2d.js'


describe('CanvasImageRenderer', () => {

    let renderer
    let ctx


    beforeEach(() => {
        renderer = new CanvasImageRenderer()
        ctx = {
            save: () => {},
            restore: () => {},
            scale: () => {},
            drawImage: () => {}
        }
    })


    test('extends CanvasObjectRenderer', () => {
        expect(renderer).toBeInstanceOf(CanvasObjectRenderer)
    })


    test('handles returns Image2D', () => {
        expect(CanvasImageRenderer.handles).toEqual([Image2D])
    })


    describe('render', () => {

        test('does not draw when image is null', () => {
            let drawn = false
            ctx.drawImage = () => {
                drawn = true
            }

            const image = {
                image: null,
                width: 100,
                height: 100,
                anchorX: 0,
                anchorY: 0
            }

            renderer.render(image, ctx)

            expect(drawn).toBe(false)
        })


        test('does not draw when image is not complete', () => {
            let drawn = false
            ctx.drawImage = () => {
                drawn = true
            }

            const image = {
                image: {complete: false},
                width: 100,
                height: 100,
                anchorX: 0,
                anchorY: 0
            }

            renderer.render(image, ctx)

            expect(drawn).toBe(false)
        })


        test('draws image when complete', () => {
            let drawn = false
            ctx.drawImage = () => {
                drawn = true
            }

            const image = {
                image: {complete: true},
                width: 100,
                height: 100,
                anchorX: 0,
                anchorY: 0
            }

            renderer.render(image, ctx)

            expect(drawn).toBe(true)
        })


        test('saves and restores context', () => {
            let saved = false
            let restored = false
            ctx.save = () => {
                saved = true
            }
            ctx.restore = () => {
                restored = true
            }

            const image = {
                image: {complete: true},
                width: 100,
                height: 100,
                anchorX: 0,
                anchorY: 0
            }

            renderer.render(image, ctx)

            expect(saved).toBe(true)
            expect(restored).toBe(true)
        })


        test('flips Y axis with scale', () => {
            let scaleArgs = null
            ctx.scale = (...args) => {
                scaleArgs = args
            }

            const image = {
                image: {complete: true},
                width: 100,
                height: 100,
                anchorX: 0,
                anchorY: 0
            }

            renderer.render(image, ctx)

            expect(scaleArgs).toEqual([1, -1])
        })


        test('draws with correct parameters', () => {
            let drawArgs = null
            ctx.drawImage = (...args) => {
                drawArgs = args
            }

            const imgElement = {complete: true}
            const image = {
                image: imgElement,
                width: 100,
                height: 50,
                anchorX: 0,
                anchorY: 0
            }

            renderer.render(image, ctx)

            expect(drawArgs[0]).toBe(imgElement)
            expect(drawArgs[1]).toBe(-0)
            expect(drawArgs[2]).toBe(-0 - 50)
            expect(drawArgs[3]).toBe(100)
            expect(drawArgs[4]).toBe(50)
        })


        test('applies anchor offset', () => {
            let drawArgs = null
            ctx.drawImage = (...args) => {
                drawArgs = args
            }

            const image = {
                image: {complete: true},
                width: 100,
                height: 100,
                anchorX: 0.5,
                anchorY: 0.5
            }

            renderer.render(image, ctx)

            expect(drawArgs[1]).toBe(-50)
            expect(drawArgs[2]).toBe(-50)
        })

    })

})
