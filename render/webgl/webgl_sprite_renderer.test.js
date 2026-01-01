import {describe, test, expect, vi} from 'vitest'
import WebGLSpriteRenderer from './webgl_sprite_renderer.js'
import Image2D from '../image_2d.js'
import Sprite2D from '../sprite_2d.js'


describe(WebGLSpriteRenderer, () => {

    test('handles returns Image2D and Sprite2D', () => {
        expect(WebGLSpriteRenderer.handles).toEqual([Image2D, Sprite2D])
    })


    test('init creates sprite batch', () => {
        const renderer = new WebGLSpriteRenderer()
        const mockGl = {
            createBuffer: vi.fn(() => ({})),
            bindBuffer: vi.fn(),
            bufferData: vi.fn(),
            ARRAY_BUFFER: 'ARRAY_BUFFER',
            ELEMENT_ARRAY_BUFFER: 'ELEMENT_ARRAY_BUFFER',
            STATIC_DRAW: 'STATIC_DRAW'
        }
        const mockContext = {
            gl: mockGl,
            spriteProgram: {},
            textureManager: {}
        }
        renderer.init(mockContext)
        expect(renderer.context).toBe(mockContext)
    })


    test('reset calls begin on sprite batch', () => {
        const renderer = new WebGLSpriteRenderer()
        const mockGl = {
            createBuffer: vi.fn(() => ({})),
            bindBuffer: vi.fn(),
            bufferData: vi.fn(),
            ARRAY_BUFFER: 'ARRAY_BUFFER',
            ELEMENT_ARRAY_BUFFER: 'ELEMENT_ARRAY_BUFFER',
            STATIC_DRAW: 'STATIC_DRAW'
        }
        const mockContext = {
            gl: mockGl,
            spriteProgram: {},
            textureManager: {}
        }
        renderer.init(mockContext)
        expect(() => renderer.reset()).not.toThrow()
    })


    test('dispose cleans up sprite batch', () => {
        const renderer = new WebGLSpriteRenderer()
        const mockGl = {
            createBuffer: vi.fn(() => ({})),
            bindBuffer: vi.fn(),
            bufferData: vi.fn(),
            deleteBuffer: vi.fn(),
            ARRAY_BUFFER: 'ARRAY_BUFFER',
            ELEMENT_ARRAY_BUFFER: 'ELEMENT_ARRAY_BUFFER',
            STATIC_DRAW: 'STATIC_DRAW'
        }
        const mockContext = {
            gl: mockGl,
            spriteProgram: {},
            textureManager: {}
        }
        renderer.init(mockContext)
        renderer.dispose()
        expect(mockGl.deleteBuffer).toHaveBeenCalledTimes(2)
    })

})
