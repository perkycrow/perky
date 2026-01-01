import {describe, test, expect, vi} from 'vitest'
import WebGLPrimitiveRenderer from './webgl_primitive_renderer.js'


describe(WebGLPrimitiveRenderer, () => {

    test('vertexBuffer returns null before init', () => {
        const renderer = new WebGLPrimitiveRenderer()
        expect(renderer.vertexBuffer).toBeNull()
    })


    test('init creates vertex buffer', () => {
        const renderer = new WebGLPrimitiveRenderer()
        const mockBuffer = {}
        const mockGl = {createBuffer: vi.fn(() => mockBuffer)}
        const mockContext = {gl: mockGl}
        renderer.init(mockContext)
        expect(mockGl.createBuffer).toHaveBeenCalled()
        expect(renderer.vertexBuffer).toBe(mockBuffer)
    })


    test('flush does nothing when collected is empty', () => {
        const renderer = new WebGLPrimitiveRenderer()
        const mockGl = {
            createBuffer: vi.fn(() => ({})),
            useProgram: vi.fn()
        }
        const mockContext = {gl: mockGl}
        renderer.init(mockContext)
        renderer.flush({})
        expect(mockGl.useProgram).not.toHaveBeenCalled()
    })


    test('renderObject is defined', () => {
        const renderer = new WebGLPrimitiveRenderer()
        expect(typeof renderer.renderObject).toBe('function')
    })


    test('dispose deletes vertex buffer', () => {
        const renderer = new WebGLPrimitiveRenderer()
        const mockBuffer = {}
        const mockGl = {
            createBuffer: vi.fn(() => mockBuffer),
            deleteBuffer: vi.fn()
        }
        const mockContext = {gl: mockGl}
        renderer.init(mockContext)
        renderer.dispose()
        expect(mockGl.deleteBuffer).toHaveBeenCalledWith(mockBuffer)
        expect(renderer.vertexBuffer).toBeNull()
    })

})
