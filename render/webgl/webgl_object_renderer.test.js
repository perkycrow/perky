import {describe, test, expect} from 'vitest'
import WebGLObjectRenderer from './webgl_object_renderer.js'


describe(WebGLObjectRenderer, () => {

    test('handles returns empty array', () => {
        expect(WebGLObjectRenderer.handles).toEqual([])
    })


    test('gl returns null before init', () => {
        const renderer = new WebGLObjectRenderer()
        expect(renderer.gl).toBeNull()
    })


    test('context returns null before init', () => {
        const renderer = new WebGLObjectRenderer()
        expect(renderer.context).toBeNull()
    })


    test('init sets gl and context', () => {
        const renderer = new WebGLObjectRenderer()
        const mockGl = {}
        const mockContext = {gl: mockGl}
        renderer.init(mockContext)
        expect(renderer.gl).toBe(mockGl)
        expect(renderer.context).toBe(mockContext)
    })


    test('collected returns empty array initially', () => {
        const renderer = new WebGLObjectRenderer()
        expect(renderer.collected).toEqual([])
    })


    test('collect adds object to collected', () => {
        const renderer = new WebGLObjectRenderer()
        const obj = {name: 'test'}
        renderer.collect(obj, 1)
        expect(renderer.collected).toEqual([{object: obj, opacity: 1, hints: null}])
    })


    test('collect with hints', () => {
        const renderer = new WebGLObjectRenderer()
        const obj = {name: 'test'}
        const hints = {key: 'value'}
        renderer.collect(obj, 0.5, hints)
        expect(renderer.collected).toEqual([{object: obj, opacity: 0.5, hints}])
    })


    test('reset clears collected', () => {
        const renderer = new WebGLObjectRenderer()
        renderer.collect({}, 1)
        renderer.reset()
        expect(renderer.collected).toEqual([])
    })


    test('flush does not throw', () => {
        const renderer = new WebGLObjectRenderer()
        expect(() => renderer.flush({}, null)).not.toThrow()
    })


    test('dispose clears state', () => {
        const renderer = new WebGLObjectRenderer()
        const mockContext = {gl: {}}
        renderer.init(mockContext)
        renderer.collect({}, 1)
        renderer.dispose()
        expect(renderer.gl).toBeNull()
        expect(renderer.context).toBeNull()
        expect(renderer.collected).toEqual([])
    })

})
