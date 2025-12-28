import {describe, it, expect} from 'vitest'
import RendererFactory from './renderer_factory'
import Canvas2D from './canvas_2d'
import WebGLCanvas2D from './webgl_canvas_2d'


describe('RendererFactory', () => {

    describe('getRendererClass', () => {

        it('returns Canvas2D for canvas type', () => {
            expect(RendererFactory.getRendererClass('canvas')).toBe(Canvas2D)
        })

        it('returns WebGLCanvas2D for webgl type', () => {
            expect(RendererFactory.getRendererClass('webgl')).toBe(WebGLCanvas2D)
        })

        it('throws error for unknown type', () => {
            expect(() => RendererFactory.getRendererClass('unknown')).toThrow('Unknown renderer type: "unknown"')
        })

        it('includes available types in error message', () => {
            expect(() => RendererFactory.getRendererClass('invalid')).toThrow('canvas, webgl')
        })

    })


    describe('isValidType', () => {

        it('returns true for canvas', () => {
            expect(RendererFactory.isValidType('canvas')).toBe(true)
        })

        it('returns true for webgl', () => {
            expect(RendererFactory.isValidType('webgl')).toBe(true)
        })

        it('returns false for unknown types', () => {
            expect(RendererFactory.isValidType('html')).toBe(false)
            expect(RendererFactory.isValidType('svg')).toBe(false)
            expect(RendererFactory.isValidType('')).toBe(false)
        })

    })


    describe('getAvailableTypes', () => {

        it('returns array of available types', () => {
            const types = RendererFactory.getAvailableTypes()
            expect(types).toContain('canvas')
            expect(types).toContain('webgl')
            expect(types.length).toBe(2)
        })

    })

})
