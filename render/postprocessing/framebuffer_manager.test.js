import {describe, test, expect, beforeEach, vi} from 'vitest'
import FramebufferManager from './framebuffer_manager.js'


function createMockGL () {
    const framebuffers = []
    const renderbuffers = []
    const textures = []

    return {
        FRAMEBUFFER: 0x8D40,
        RENDERBUFFER: 0x8D41,
        READ_FRAMEBUFFER: 0x8CA8,
        DRAW_FRAMEBUFFER: 0x8CA9,
        COLOR_ATTACHMENT0: 0x8CE0,
        TEXTURE_2D: 0x0DE1,
        RGBA8: 0x8058,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        LINEAR: 0x2601,
        CLAMP_TO_EDGE: 0x812F,
        ARRAY_BUFFER: 0x8892,
        STATIC_DRAW: 0x88E4,
        MAX_SAMPLES: 0x8D57,
        COLOR_BUFFER_BIT: 0x00004000,
        NEAREST: 0x2600,
        FRAMEBUFFER_COMPLETE: 0x8CD5,
        FRAMEBUFFER_INCOMPLETE_ATTACHMENT: 0x8CD6,

        getParameter: vi.fn((param) => {
            if (param === 0x8D57) {
                return 8
            }
            return 0
        }),

        createFramebuffer: vi.fn(() => {
            const fb = {id: framebuffers.length}
            framebuffers.push(fb)
            return fb
        }),

        deleteFramebuffer: vi.fn(),

        bindFramebuffer: vi.fn(),

        createRenderbuffer: vi.fn(() => {
            const rb = {id: renderbuffers.length}
            renderbuffers.push(rb)
            return rb
        }),

        deleteRenderbuffer: vi.fn(),

        bindRenderbuffer: vi.fn(),

        renderbufferStorageMultisample: vi.fn(),

        framebufferRenderbuffer: vi.fn(),

        framebufferTexture2D: vi.fn(),

        checkFramebufferStatus: vi.fn(() => 0x8CD5),

        createTexture: vi.fn(() => {
            const tex = {id: textures.length}
            textures.push(tex)
            return tex
        }),

        deleteTexture: vi.fn(),

        bindTexture: vi.fn(),

        texImage2D: vi.fn(),

        texParameteri: vi.fn(),

        viewport: vi.fn(),

        blitFramebuffer: vi.fn()
    }
}


describe(FramebufferManager, () => {

    let gl
    let manager

    beforeEach(() => {
        gl = createMockGL()
        manager = new FramebufferManager(gl, 800, 600, 4)
    })


    test('constructor', () => {
        expect(manager.width).toBe(800)
        expect(manager.height).toBe(600)
        expect(manager.samples).toBe(4)
    })


    test('constructor clamps samples to MAX_SAMPLES', () => {
        gl.getParameter = vi.fn(() => 2)
        const m = new FramebufferManager(gl, 100, 100, 8)
        expect(m.samples).toBe(2)
    })


    test('resize', () => {
        manager.resize(1024, 768)
        expect(manager.width).toBe(1024)
        expect(manager.height).toBe(768)
    })


    test('resize with same dimensions does nothing', () => {
        const deleteCount = gl.deleteFramebuffer.mock.calls.length
        manager.resize(800, 600)
        expect(gl.deleteFramebuffer.mock.calls.length).toBe(deleteCount)
    })


    test('bindSceneBuffer', () => {
        manager.bindSceneBuffer()
        expect(gl.bindFramebuffer).toHaveBeenCalled()
        expect(gl.viewport).toHaveBeenCalledWith(0, 0, 800, 600)
    })


    test('resolveSceneBuffer', () => {
        manager.resolveSceneBuffer()
        expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.READ_FRAMEBUFFER, expect.anything())
        expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.DRAW_FRAMEBUFFER, expect.anything())
        expect(gl.blitFramebuffer).toHaveBeenCalled()
    })


    test('getSceneTexture', () => {
        const texture = manager.getSceneTexture()
        expect(texture).toBeDefined()
        expect(texture).not.toBeNull()
    })


    test('resetPingPong', () => {
        manager.swapAndGetTexture()
        manager.resetPingPong()
        const tex1 = manager.swapAndGetTexture()
        manager.resetPingPong()
        const tex2 = manager.swapAndGetTexture()
        expect(tex1).toBe(tex2)
    })


    test('bindPingPong', () => {
        manager.bindPingPong()
        expect(gl.bindFramebuffer).toHaveBeenCalled()
        expect(gl.viewport).toHaveBeenCalledWith(0, 0, 800, 600)
    })


    test('swapAndGetTexture alternates buffers', () => {
        manager.resetPingPong()
        const tex1 = manager.swapAndGetTexture()
        const tex2 = manager.swapAndGetTexture()
        const tex3 = manager.swapAndGetTexture()
        expect(tex1).not.toBe(tex2)
        expect(tex1).toBe(tex3)
    })


    test('getOrCreateBuffer creates new buffer', () => {
        const buffer = manager.getOrCreateBuffer('test')
        expect(buffer).toBeDefined()
        expect(buffer.framebuffer).toBeDefined()
        expect(buffer.texture).toBeDefined()
    })


    test('getOrCreateBuffer returns existing buffer', () => {
        const buffer1 = manager.getOrCreateBuffer('test')
        const buffer2 = manager.getOrCreateBuffer('test')
        expect(buffer1).toBe(buffer2)
    })


    test('bindBuffer', () => {
        manager.getOrCreateBuffer('test')
        const result = manager.bindBuffer('test')
        expect(result).toBe(true)
        expect(gl.bindFramebuffer).toHaveBeenCalled()
        expect(gl.viewport).toHaveBeenCalledWith(0, 0, 800, 600)
    })


    test('bindBuffer returns false for non-existent buffer', () => {
        const result = manager.bindBuffer('nonexistent')
        expect(result).toBe(false)
    })


    test('getBufferTexture', () => {
        manager.getOrCreateBuffer('test')
        const texture = manager.getBufferTexture('test')
        expect(texture).toBeDefined()
        expect(texture).not.toBeNull()
    })


    test('getBufferTexture returns null for non-existent buffer', () => {
        const texture = manager.getBufferTexture('nonexistent')
        expect(texture).toBeNull()
    })


    test('resolveToBuffer', () => {
        manager.getOrCreateBuffer('test')
        const result = manager.resolveToBuffer('test')
        expect(result).toBe(true)
        expect(gl.blitFramebuffer).toHaveBeenCalled()
    })


    test('resolveToBuffer returns false for non-existent buffer', () => {
        const result = manager.resolveToBuffer('nonexistent')
        expect(result).toBe(false)
    })


    test('disposeBuffer', () => {
        manager.getOrCreateBuffer('test')
        const result = manager.disposeBuffer('test')
        expect(result).toBe(true)
        expect(gl.deleteFramebuffer).toHaveBeenCalled()
        expect(gl.deleteTexture).toHaveBeenCalled()
    })


    test('disposeBuffer returns false for non-existent buffer', () => {
        const result = manager.disposeBuffer('nonexistent')
        expect(result).toBe(false)
    })


    test('disposeNamedBuffers', () => {
        manager.getOrCreateBuffer('test1')
        manager.getOrCreateBuffer('test2')
        manager.disposeNamedBuffers()
        expect(manager.getBufferTexture('test1')).toBeNull()
        expect(manager.getBufferTexture('test2')).toBeNull()
    })


    test('bindScreen', () => {
        manager.bindScreen()
        expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, null)
        expect(gl.viewport).toHaveBeenCalledWith(0, 0, 800, 600)
    })


    test('dispose', () => {
        manager.getOrCreateBuffer('test')
        manager.dispose()
        expect(gl.deleteFramebuffer).toHaveBeenCalled()
        expect(gl.deleteRenderbuffer).toHaveBeenCalled()
        expect(gl.deleteTexture).toHaveBeenCalled()
    })

})
