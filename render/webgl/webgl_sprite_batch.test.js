import {describe, test, expect, vi} from 'vitest'
import WebGLSpriteBatch from './webgl_sprite_batch.js'
import Sprite from '../sprite.js'
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
        const sprite = new Sprite({image: mockImage})
        sprite.updateWorldMatrix()

        batch.begin()
        batch.addSprite(sprite, 1.0)

        expect(batch.spriteCount).toBe(1)
    })


    test('addSprite with hints includes tint and effectParams', () => {
        const gl = createMockGLWithSpies()
        const mockTexture = {}
        const textureManager = {getTexture: vi.fn(() => mockTexture)}
        const batch = new WebGLSpriteBatch(gl, {}, textureManager)

        const mockImage = {complete: true, naturalWidth: 100, width: 100, height: 100}
        const sprite = new Sprite({image: mockImage})
        sprite.updateWorldMatrix()

        const hints = {
            tint: [1, 0.5, 0.25, 1],
            effectParams: [0.1, 0.2, 0.3, 0.4]
        }

        batch.begin()
        batch.addSprite(sprite, 0.8, hints)

        expect(batch.spriteCount).toBe(1)
        expect(batch.vertexIndex).toBeGreaterThan(0)
    })


    test('addSprite flushes when texture changes', () => {
        const gl = createMockGLWithSpies()
        const texture1 = {id: 1}
        const texture2 = {id: 2}
        let textureCallCount = 0
        const textureManager = {
            getTexture: vi.fn(() => {
                textureCallCount++
                return textureCallCount === 1 ? texture1 : texture2
            })
        }

        const mockProgram = {
            program: {},
            uniforms: {uTexture: 0},
            attributes: {aPosition: 0, aTexCoord: 1, aOpacity: 2}
        }
        const batch = new WebGLSpriteBatch(gl, mockProgram, textureManager)

        const mockImage1 = {complete: true, naturalWidth: 100, width: 100, height: 100}
        const mockImage2 = {complete: true, naturalWidth: 50, width: 50, height: 50}
        const sprite1 = new Sprite({image: mockImage1})
        const sprite2 = new Sprite({image: mockImage2})
        sprite1.updateWorldMatrix()
        sprite2.updateWorldMatrix()

        batch.begin(mockProgram)
        batch.addSprite(sprite1, 1.0)
        expect(batch.spriteCount).toBe(1)

        batch.addSprite(sprite2, 1.0)
        expect(gl.drawElements).toHaveBeenCalled()
    })


    test('flush draws sprites and resets counters', () => {
        const gl = createMockGLWithSpies()
        const mockTexture = {}
        const textureManager = {getTexture: vi.fn(() => mockTexture)}

        const mockProgram = {
            program: {},
            uniforms: {uTexture: 0},
            attributes: {aPosition: 0, aTexCoord: 1, aOpacity: 2}
        }
        const batch = new WebGLSpriteBatch(gl, mockProgram, textureManager)

        const mockImage = {complete: true, naturalWidth: 100, width: 100, height: 100}
        const sprite = new Sprite({image: mockImage})
        sprite.updateWorldMatrix()

        batch.begin(mockProgram)
        batch.addSprite(sprite, 1.0)
        expect(batch.spriteCount).toBe(1)

        batch.flush()
        expect(gl.useProgram).toHaveBeenCalledWith(mockProgram.program)
        expect(gl.drawElements).toHaveBeenCalled()
        expect(batch.spriteCount).toBe(0)
        expect(batch.vertexIndex).toBe(0)
    })


    test('flush uses alternate program when provided', () => {
        const gl = createMockGLWithSpies()
        const mockTexture = {}
        const textureManager = {getTexture: vi.fn(() => mockTexture)}

        const defaultProgram = {
            program: {name: 'default'},
            uniforms: {uTexture: 0},
            attributes: {aPosition: 0, aTexCoord: 1, aOpacity: 2}
        }
        const alternateProgram = {
            program: {name: 'alternate'},
            uniforms: {uTexture: 0},
            attributes: {aPosition: 0, aTexCoord: 1, aOpacity: 2}
        }
        const batch = new WebGLSpriteBatch(gl, defaultProgram, textureManager)

        const mockImage = {complete: true, naturalWidth: 100, width: 100, height: 100}
        const sprite = new Sprite({image: mockImage})
        sprite.updateWorldMatrix()

        batch.begin(defaultProgram)
        batch.addSprite(sprite, 1.0)

        batch.flush(alternateProgram)
        expect(gl.useProgram).toHaveBeenCalledWith(alternateProgram.program)
    })


    test('flush binds optional attributes when available', () => {
        const gl = createMockGLWithSpies()
        const mockTexture = {}
        const textureManager = {getTexture: vi.fn(() => mockTexture)}

        const mockProgram = {
            program: {},
            uniforms: {uTexture: 0},
            attributes: {
                aPosition: 0,
                aTexCoord: 1,
                aOpacity: 2,
                aAnchorY: 3,
                aTintColor: 4,
                aEffectParams: 5,
                aUVBounds: 6
            }
        }
        const batch = new WebGLSpriteBatch(gl, mockProgram, textureManager)

        const mockImage = {complete: true, naturalWidth: 100, width: 100, height: 100}
        const sprite = new Sprite({image: mockImage})
        sprite.updateWorldMatrix()

        batch.begin(mockProgram)
        batch.addSprite(sprite, 1.0)
        batch.flush()

        expect(gl.enableVertexAttribArray).toHaveBeenCalledWith(3)
        expect(gl.enableVertexAttribArray).toHaveBeenCalledWith(4)
        expect(gl.enableVertexAttribArray).toHaveBeenCalledWith(5)
        expect(gl.enableVertexAttribArray).toHaveBeenCalledWith(6)
    })


    test('addSprite does nothing when image has zero width', () => {
        const gl = createMockGLWithSpies()
        const textureManager = {getTexture: vi.fn(() => null)}
        const batch = new WebGLSpriteBatch(gl, {}, textureManager)

        const sprite = {
            region: {image: {complete: true, naturalWidth: 100, width: 0}},
            getBounds: () => ({minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10}),
            worldMatrix: [1, 0, 0, 1, 0, 0],
            anchorX: 0.5,
            anchorY: 0.5
        }

        batch.begin()
        batch.addSprite(sprite, 1.0)

        expect(batch.spriteCount).toBe(0)
    })

})
