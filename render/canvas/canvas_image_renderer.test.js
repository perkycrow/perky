import {describe, test, expect, beforeEach} from 'vitest'
import CanvasImageRenderer from './canvas_image_renderer.js'
import CanvasObjectRenderer from './canvas_object_renderer.js'
import Image2D from '../image_2d.js'


function createMockImage (width = 256, height = 256) {
    return {
        width,
        height,
        naturalWidth: width,
        naturalHeight: height,
        complete: true
    }
}


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

            const image = new Image2D()

            renderer.render(image, ctx)

            expect(drawn).toBe(false)
        })


        test('does not draw when image is not complete', () => {
            let drawn = false
            ctx.drawImage = () => {
                drawn = true
            }

            const img = {complete: false, width: 100, height: 100}
            const image = new Image2D({image: img, width: 100, height: 100})

            renderer.render(image, ctx)

            expect(drawn).toBe(false)
        })


        test('draws image when complete', () => {
            let drawn = false
            ctx.drawImage = () => {
                drawn = true
            }

            const img = createMockImage()
            const image = new Image2D({image: img, width: 100, height: 100})

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

            const img = createMockImage()
            const image = new Image2D({image: img, width: 100, height: 100})

            renderer.render(image, ctx)

            expect(saved).toBe(true)
            expect(restored).toBe(true)
        })


        test('flips Y axis with scale', () => {
            let scaleArgs = null
            ctx.scale = (...args) => {
                scaleArgs = args
            }

            const img = createMockImage()
            const image = new Image2D({image: img, width: 100, height: 100})

            renderer.render(image, ctx)

            expect(scaleArgs).toEqual([1, -1])
        })


        test('draws with correct parameters', () => {
            let drawArgs = null
            ctx.drawImage = (...args) => {
                drawArgs = args
            }

            const img = createMockImage(200, 100)
            const image = new Image2D({
                image: img,
                width: 100,
                height: 50,
                anchorX: 0,
                anchorY: 0
            })

            renderer.render(image, ctx)

            expect(drawArgs[0]).toBe(img)
            expect(drawArgs[5]).toBeCloseTo(0)
            expect(drawArgs[6]).toBeCloseTo(-50)
            expect(drawArgs[7]).toBe(100)
            expect(drawArgs[8]).toBe(50)
        })


        test('applies anchor offset', () => {
            let drawArgs = null
            ctx.drawImage = (...args) => {
                drawArgs = args
            }

            const img = createMockImage()
            const image = new Image2D({
                image: img,
                width: 100,
                height: 100,
                anchorX: 0.5,
                anchorY: 0.5
            })

            renderer.render(image, ctx)

            expect(drawArgs[5]).toBe(-50)
            expect(drawArgs[6]).toBe(-50)
        })

    })

})
