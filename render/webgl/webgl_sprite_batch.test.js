import {describe, test, expect, vi} from 'vitest'
import WebGLSpriteBatch from './webgl_sprite_batch.js'


function createMockGl () {
    return {
        createBuffer: vi.fn(() => ({})),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        ARRAY_BUFFER: 'ARRAY_BUFFER',
        ELEMENT_ARRAY_BUFFER: 'ELEMENT_ARRAY_BUFFER',
        STATIC_DRAW: 'STATIC_DRAW',
        DYNAMIC_DRAW: 'DYNAMIC_DRAW'
    }
}


describe(WebGLSpriteBatch, () => {

    test('constructor creates buffers', () => {
        const gl = createMockGl()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        expect(gl.createBuffer).toHaveBeenCalledTimes(2)
        expect(batch.vertexBuffer).toBeDefined()
        expect(batch.indexBuffer).toBeDefined()
    })


    test('constructor uses default maxSprites', () => {
        const gl = createMockGl()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        expect(batch.maxSprites).toBe(1000)
    })


    test('constructor accepts custom maxSprites', () => {
        const gl = createMockGl()
        const batch = new WebGLSpriteBatch(gl, {}, {}, {maxSprites: 500})
        expect(batch.maxSprites).toBe(500)
    })


    test('begin resets state', () => {
        const gl = createMockGl()
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
        const gl = createMockGl()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        const program = {}
        batch.begin(program)
        expect(batch.activeProgram).toBe(program)
    })


    test('flush does nothing when spriteCount is 0', () => {
        const gl = createMockGl()
        gl.useProgram = vi.fn()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        batch.flush()
        expect(gl.useProgram).not.toHaveBeenCalled()
    })


    test('end calls flush', () => {
        const gl = createMockGl()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        batch.flush = vi.fn()
        batch.end()
        expect(batch.flush).toHaveBeenCalled()
    })


    test('end passes alternate program to flush', () => {
        const gl = createMockGl()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        batch.flush = vi.fn()
        const program = {}
        batch.end(program)
        expect(batch.flush).toHaveBeenCalledWith(program)
    })


    test('dispose deletes buffers', () => {
        const gl = createMockGl()
        gl.deleteBuffer = vi.fn()
        const batch = new WebGLSpriteBatch(gl, {}, {})
        batch.dispose()
        expect(gl.deleteBuffer).toHaveBeenCalledTimes(2)
    })

})
