import {describe, test, expect} from 'vitest'
import WebGLRectangleRenderer from './webgl_rectangle_renderer.js'
import Rectangle from '../rectangle.js'


describe(WebGLRectangleRenderer, () => {

    test('handles returns Rectangle', () => {
        expect(WebGLRectangleRenderer.handles).toEqual([Rectangle])
    })


    test('renderObject is defined', () => {
        const renderer = new WebGLRectangleRenderer()
        expect(typeof renderer.renderObject).toBe('function')
    })

})
