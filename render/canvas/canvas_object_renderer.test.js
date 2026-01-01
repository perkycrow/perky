import {describe, test, expect, beforeEach} from 'vitest'
import CanvasObjectRenderer from './canvas_object_renderer.js'


describe('CanvasObjectRenderer', () => {

    let renderer
    let ctx
    let mockContext


    beforeEach(() => {
        renderer = new CanvasObjectRenderer()
        ctx = {
            save: () => {},
            restore: () => {},
            transform: () => {},
            globalAlpha: 1,
            filter: 'none'
        }
        mockContext = {ctx}
    })


    test('handles returns empty array', () => {
        expect(CanvasObjectRenderer.handles).toEqual([])
    })


    test('ctx returns null before init', () => {
        expect(renderer.ctx).toBeNull()
    })


    test('context returns null before init', () => {
        expect(renderer.context).toBeNull()
    })


    describe('init', () => {

        test('stores context', () => {
            renderer.init(mockContext)
            expect(renderer.context).toBe(mockContext)
        })


        test('ctx returns context.ctx', () => {
            renderer.init(mockContext)
            expect(renderer.ctx).toBe(ctx)
        })

    })


    describe('collect', () => {

        test('collects objects for later rendering', () => {
            renderer.init(mockContext)
            const obj = {worldMatrix: [1, 0, 0, 1, 0, 0]}
            renderer.collect(obj, 1)
            expect(() => renderer.flush()).not.toThrow()
        })


        test('collects with hints', () => {
            renderer.init(mockContext)
            const obj = {worldMatrix: [1, 0, 0, 1, 0, 0]}
            renderer.collect(obj, 0.5, {filter: 'blur(5px)'})
            expect(() => renderer.flush()).not.toThrow()
        })

    })


    test('reset clears collected objects', () => {
        renderer.init(mockContext)
        const obj = {worldMatrix: [1, 0, 0, 1, 0, 0]}
        renderer.collect(obj, 1)
        renderer.reset()

        let transformCalled = false
        ctx.transform = () => {
            transformCalled = true
        }
        renderer.flush()

        expect(transformCalled).toBe(false)
    })


    describe('flush', () => {

        test('applies world matrix transform', () => {
            renderer.init(mockContext)

            let transformArgs = null
            ctx.transform = (...args) => {
                transformArgs = args
            }

            const obj = {worldMatrix: [1, 2, 3, 4, 5, 6]}
            renderer.collect(obj, 1)
            renderer.flush()

            expect(transformArgs).toEqual([1, 2, 3, 4, 5, 6])
        })


        test('sets global alpha from opacity', () => {
            renderer.init(mockContext)

            const obj = {worldMatrix: [1, 0, 0, 1, 0, 0]}
            renderer.collect(obj, 0.7)
            renderer.flush()

            expect(ctx.globalAlpha).toBe(0.7)
        })


        test('applies filter from hints', () => {
            renderer.init(mockContext)

            const obj = {worldMatrix: [1, 0, 0, 1, 0, 0]}
            renderer.collect(obj, 1, {filter: 'blur(10px)'})
            renderer.flush()

            expect(ctx.filter).toBe('blur(10px)')
        })


        test('saves and restores context for each object', () => {
            renderer.init(mockContext)

            let saveCount = 0
            let restoreCount = 0
            ctx.save = () => {
                saveCount++
            }
            ctx.restore = () => {
                restoreCount++
            }

            const obj1 = {worldMatrix: [1, 0, 0, 1, 0, 0]}
            const obj2 = {worldMatrix: [1, 0, 0, 1, 0, 0]}
            renderer.collect(obj1, 1)
            renderer.collect(obj2, 1)
            renderer.flush()

            expect(saveCount).toBe(2)
            expect(restoreCount).toBe(2)
        })

    })


    test('render is a no-op by default', () => {
        expect(() => renderer.render()).not.toThrow()
    })


    describe('dispose', () => {

        test('clears context reference', () => {
            renderer.init(mockContext)
            renderer.dispose()
            expect(renderer.context).toBeNull()
        })


        test('clears collected objects', () => {
            renderer.init(mockContext)
            const obj = {worldMatrix: [1, 0, 0, 1, 0, 0]}
            renderer.collect(obj, 1)
            renderer.dispose()

            renderer.init(mockContext)
            let transformCalled = false
            ctx.transform = () => {
                transformCalled = true
            }
            renderer.flush()

            expect(transformCalled).toBe(false)
        })

    })

})
