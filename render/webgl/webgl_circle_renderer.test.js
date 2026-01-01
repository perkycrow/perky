import {describe, test, expect} from 'vitest'
import WebGLCircleRenderer from './webgl_circle_renderer.js'
import Circle from '../circle.js'


describe(WebGLCircleRenderer, () => {

    test('handles returns Circle', () => {
        expect(WebGLCircleRenderer.handles).toEqual([Circle])
    })


    test('renderObject is defined', () => {
        const renderer = new WebGLCircleRenderer()
        expect(typeof renderer.renderObject).toBe('function')
    })

})
