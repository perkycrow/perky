import {describe, test, expect} from 'vitest'
import WebGLLineRenderer from './webgl_line_renderer.js'
import Line from '../line.js'


describe(WebGLLineRenderer, () => {

    test('handles returns Line', () => {
        expect(WebGLLineRenderer.handles).toEqual([Line])
    })


    test('renderObject is defined', () => {
        const renderer = new WebGLLineRenderer()
        expect(typeof renderer.renderObject).toBe('function')
    })

})
