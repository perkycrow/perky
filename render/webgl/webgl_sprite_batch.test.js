import {describe, test, expect, vi} from 'vitest'
import WebGLSpriteBatch from './webgl_sprite_batch.js'
import Image2D from '../image_2d.js'
import {createMockGLWithSpies} from '../test_helpers.js'


describe(WebGLSpriteBatch, () => {

    test('constructor creates buffers', () => {
        const gl = createMockGLWithSpies()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        expect(gl.createBuffer).toHaveBeenCalledTimes(2)
        expect(batch.vertexBuffer).toBeDefined()
        expect(batch.indexBuffer).toBeDefined()
    })


    test('constructor uses default maxSprites', () => {
        const gl = createMockGLWithSpies()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        expect(batch.maxSprites).toBe(1000)
    })


    test('constructor accepts custom maxSprites', () => {
        const gl = createMockGLWithSpies()
        const batch = new WebGLSpriteBatch(gl, {}, {}, {maxSprites: 500})
        expect(batch.maxSprites).toBe(500)
    })


    test('begin resets state', () => {
        const gl = createMockGLWithSpies()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        batch.spriteCount = 10
        batch.vertexIndex = 100
        batch.currentTexture = {}
        batch.begin()
        expect(batch.spriteCount).toBe(0)
        expect(batch.vertexIndex).toBe(0)
        expect(batch.currentTexture).toBeNull()
    })


    test('begin sets active program', () => {
        const gl = createMockGLWithSpies()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        const program = {}
        batch.begin(program)
        expect(batch.activeProgram).toBe(program)
    })


    test('flush does nothing when spriteCount is 0', () => {
        const gl = createMockGLWithSpies()
        gl.useProgram = vi.fn()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        batch.flush()
        expect(gl.useProgram).not.toHaveBeenCalled()
    })


    test('end calls flush', () => {
        const gl = createMockGLWithSpies()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        batch.flush = vi.fn()
        batch.end()
        expect(batch.flush).toHaveBeenCalled()
    })


    test('end passes alternate program to flush', () => {
        const gl = createMockGLWithSpies()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        batch.flush = vi.fn()
        const program = {}
        batch.end(program)
        expect(batch.flush).toHaveBeenCalledWith(program)
    })


    test('dispose deletes buffers', () => {
        const gl = createMockGLWithSpies()
        gl.deleteBuffer = vi.fn()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        batch.dispose()
        expect(gl.deleteBuffer).toHaveBeenCalledTimes(2)
    })


    test('addSprite does nothing when image is not ready', () => {
        const gl = createMockGLWithSpies()
        const textureManager = {getTexture: vi.fn(() => null)}
        const batch = new WebGLSpriteBatch(gl, {}, textureManager)

        const sprite = {
            image: {complete: false, naturalWidth: 0},
            getBounds: () => ({minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10}),
            worldMatrix: [1, 0, 0, 1, 0, 0],
            anchorX: 0.5,
            anchorY: 0.5
        }

        batch.begin()
        batch.addSprite(sprite, 1.0)

        expect(batch.spriteCount).toBe(0)
    })


    test('addSprite increments spriteCount for valid sprites', () => {
        const gl = createMockGLWithSpies()
        const mockTexture = {}
        const textureManager = {getTexture: vi.fn(() => mockTexture)}
        const batch = new WebGLSpriteBatch(gl, {}, textureManager)

        const mockImage = {complete: true, naturalWidth: 100, width: 100, height: 100}
        const sprite = new Image2D({image: mockImage})
        sprite.updateWorldMatrix()

        batch.begin()
        batch.addSprite(sprite, 1.0)

        expect(batch.spriteCount).toBe(1)
    })

})
