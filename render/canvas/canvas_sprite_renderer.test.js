import {describe, test, expect, beforeEach} from 'vitest'
import CanvasSpriteRenderer from './canvas_sprite_renderer.js'
import CanvasObjectRenderer from './canvas_object_renderer.js'
import Sprite from '../sprite.js'


describe('CanvasSpriteRenderer', () => {

    let renderer
    let ctx


    beforeEach(() => {
        renderer = new CanvasSpriteRenderer()
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


    test('handles returns Sprite', () => {
        expect(CanvasSpriteRenderer.handles).toEqual([Sprite])
    })


    describe('render', () => {

        test('does not draw without currentFrame', () => {
            let drawn = false
            ctx.drawImage = () => {
                drawn = true
            }

            const sprite = {
                image: null,
                currentFrame: null,
                anchorX: 0,
                anchorY: 0,
                width: null,
                height: null
            }

            renderer.render(sprite, ctx)

            expect(drawn).toBe(false)
        })


        test('does not draw when image is not complete', () => {
            let drawn = false
            ctx.drawImage = () => {
                drawn = true
            }

            const sprite = {
                image: {complete: false, naturalWidth: 100},
                currentFrame: {frame: {x: 0, y: 0, w: 32, h: 32}},
                anchorX: 0,
                anchorY: 0,
                width: null,
                height: null
            }

            renderer.render(sprite, ctx)

            expect(drawn).toBe(false)
        })


        test('does not draw when naturalWidth is 0', () => {
            let drawn = false
            ctx.drawImage = () => {
                drawn = true
            }

            const sprite = {
                image: {complete: true, naturalWidth: 0},
                currentFrame: {frame: {x: 0, y: 0, w: 32, h: 32}},
                anchorX: 0,
                anchorY: 0,
                width: null,
                height: null
            }

            renderer.render(sprite, ctx)

            expect(drawn).toBe(false)
        })


        test('draws sprite from currentFrame', () => {
            let drawArgs = null
            ctx.drawImage = (...args) => {
                drawArgs = args
            }

            const img = {complete: true, naturalWidth: 256}
            const sprite = {
                image: img,
                currentFrame: {
                    frame: {x: 32, y: 64, w: 32, h: 32},
                    image: img
                },
                anchorX: 0,
                anchorY: 0,
                width: null,
                height: null
            }

            renderer.render(sprite, ctx)

            expect(drawArgs[0]).toBe(img)
            expect(drawArgs[1]).toBe(32)
            expect(drawArgs[2]).toBe(64)
            expect(drawArgs[3]).toBe(32)
            expect(drawArgs[4]).toBe(32)
        })


        test('uses currentFrame.image when sprite.image is null', () => {
            let drawArgs = null
            ctx.drawImage = (...args) => {
                drawArgs = args
            }

            const frameImg = {complete: true, naturalWidth: 256}
            const sprite = {
                image: null,
                currentFrame: {
                    frame: {x: 0, y: 0, w: 32, h: 32},
                    image: frameImg
                },
                anchorX: 0,
                anchorY: 0,
                width: null,
                height: null
            }

            renderer.render(sprite, ctx)

            expect(drawArgs[0]).toBe(frameImg)
        })


        test('scales by width when width is set', () => {
            let drawArgs = null
            ctx.drawImage = (...args) => {
                drawArgs = args
            }

            const img = {complete: true, naturalWidth: 256}
            const sprite = {
                image: img,
                currentFrame: {
                    frame: {x: 0, y: 0, w: 32, h: 64},
                    image: img
                },
                anchorX: 0,
                anchorY: 0,
                width: 64,
                height: null
            }

            renderer.render(sprite, ctx)

            expect(drawArgs[7]).toBe(64)
            expect(drawArgs[8]).toBe(128)
        })


        test('scales by height when height is set', () => {
            let drawArgs = null
            ctx.drawImage = (...args) => {
                drawArgs = args
            }

            const img = {complete: true, naturalWidth: 256}
            const sprite = {
                image: img,
                currentFrame: {
                    frame: {x: 0, y: 0, w: 64, h: 32},
                    image: img
                },
                anchorX: 0,
                anchorY: 0,
                width: null,
                height: 64
            }

            renderer.render(sprite, ctx)

            expect(drawArgs[7]).toBe(128)
            expect(drawArgs[8]).toBe(64)
        })


        test('applies anchor offset', () => {
            let drawArgs = null
            ctx.drawImage = (...args) => {
                drawArgs = args
            }

            const img = {complete: true, naturalWidth: 256}
            const sprite = {
                image: img,
                currentFrame: {
                    frame: {x: 0, y: 0, w: 100, h: 100},
                    image: img
                },
                anchorX: 0.5,
                anchorY: 0.5,
                width: null,
                height: null
            }

            renderer.render(sprite, ctx)

            expect(drawArgs[5]).toBe(-50)
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

            const img = {complete: true, naturalWidth: 256}
            const sprite = {
                image: img,
                currentFrame: {
                    frame: {x: 0, y: 0, w: 32, h: 32},
                    image: img
                },
                anchorX: 0,
                anchorY: 0,
                width: null,
                height: null
            }

            renderer.render(sprite, ctx)

            expect(saved).toBe(true)
            expect(restored).toBe(true)
        })


        test('flips Y axis with scale', () => {
            let scaleArgs = null
            ctx.scale = (...args) => {
                scaleArgs = args
            }

            const img = {complete: true, naturalWidth: 256}
            const sprite = {
                image: img,
                currentFrame: {
                    frame: {x: 0, y: 0, w: 32, h: 32},
                    image: img
                },
                anchorX: 0,
                anchorY: 0,
                width: null,
                height: null
            }

            renderer.render(sprite, ctx)

            expect(scaleArgs).toEqual([1, -1])
        })

    })

})
