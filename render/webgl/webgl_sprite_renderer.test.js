import {describe, test, expect, vi} from 'vitest'
import WebGLSpriteRenderer from './webgl_sprite_renderer.js'
import Image2D from '../image_2d.js'
import Sprite from '../sprite.js'


describe(WebGLSpriteRenderer, () => {

    test('handles returns Image2D and Sprite', () => {
        expect(WebGLSpriteRenderer.handles).toEqual([Image2D, Sprite])
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


    test('flush renders collected sprites with matrices', () => {
        const renderer = new WebGLSpriteRenderer()
        const mockGl = {
            createBuffer: vi.fn(() => ({})),
            bindBuffer: vi.fn(),
            bufferData: vi.fn(),
            useProgram: vi.fn(),
            uniformMatrix3fv: vi.fn(),
            uniform2f: vi.fn(),
            activeTexture: vi.fn(),
            bindTexture: vi.fn(),
            uniform1i: vi.fn(),
            enableVertexAttribArray: vi.fn(),
            vertexAttribPointer: vi.fn(),
            drawElements: vi.fn(),
            ARRAY_BUFFER: 'ARRAY_BUFFER',
            ELEMENT_ARRAY_BUFFER: 'ELEMENT_ARRAY_BUFFER',
            STATIC_DRAW: 'STATIC_DRAW',
            DYNAMIC_DRAW: 'DYNAMIC_DRAW',
            TEXTURE0: 'TEXTURE0',
            TEXTURE_2D: 'TEXTURE_2D',
            FLOAT: 'FLOAT',
            TRIANGLES: 'TRIANGLES',
            UNSIGNED_SHORT: 'UNSIGNED_SHORT'
        }

        const mockProgram = {
            program: {},
            uniforms: {
                uProjectionMatrix: 'uProjectionMatrix',
                uViewMatrix: 'uViewMatrix',
                uModelMatrix: 'uModelMatrix',
                uTexture: 'uTexture'
            },
            attributes: {
                aPosition: 0,
                aTexCoord: 1,
                aOpacity: 2
            }
        }

        const mockTexture = {}
        const mockTextureManager = {
            getTexture: vi.fn(() => mockTexture)
        }

        const mockContext = {
            gl: mockGl,
            spriteProgram: mockProgram,
            textureManager: mockTextureManager
        }

        renderer.init(mockContext)
        renderer.reset()

        const mockSprite = {
            image: {complete: true, naturalWidth: 100, width: 100, height: 100},
            getBounds: () => ({minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10}),
            worldMatrix: [1, 0, 0, 1, 0, 0],
            anchorX: 0.5,
            anchorY: 0.5
        }

        renderer.collect(mockSprite, 1.0)

        const matrices = {
            projectionMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
            viewMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1]
        }

        renderer.flush(matrices)

        expect(mockGl.useProgram).toHaveBeenCalled()
        expect(mockGl.uniformMatrix3fv).toHaveBeenCalled()
    })

})
