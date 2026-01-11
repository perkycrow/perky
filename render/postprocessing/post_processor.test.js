import {describe, test, expect, beforeEach} from 'vitest'
import PostProcessor from './post_processor.js'
import RenderPass from './render_pass.js'
import {createMockGLWithSpies, createMockShaderRegistry} from '../test_helpers.js'


class MockPass extends RenderPass {
    static shaderDefinition = {
        vertex: 'void main() {}',
        fragment: 'void main() {}',
        uniforms: ['uTexture'],
        attributes: ['aPosition', 'aTexCoord']
    }
}


describe(PostProcessor, () => {

    let gl
    let shaderRegistry
    let processor

    beforeEach(() => {
        gl = createMockGLWithSpies()
        shaderRegistry = createMockShaderRegistry()
        processor = new PostProcessor(gl, shaderRegistry, 800, 600)
    })


    test('constructor', () => {
        expect(processor.enabled).toBe(true)
        expect(processor.passes).toEqual([])
        expect(processor.framebufferManager).toBeDefined()
    })


    test('enabled getter and setter', () => {
        processor.enabled = false
        expect(processor.enabled).toBe(false)
        processor.enabled = true
        expect(processor.enabled).toBe(true)
    })


    test('addPass', () => {
        const pass = new MockPass()
        const result = processor.addPass(pass)

        expect(result).toBe(processor)
        expect(processor.passes).toContain(pass)
        expect(shaderRegistry.register).toHaveBeenCalled()
    })


    test('removePass', () => {
        const pass = new MockPass()
        processor.addPass(pass)
        vi.spyOn(pass, 'dispose')

        const result = processor.removePass(pass)

        expect(result).toBe(processor)
        expect(processor.passes).not.toContain(pass)
        expect(pass.dispose).toHaveBeenCalled()
    })


    test('removePass with non-existent pass', () => {
        const pass = new MockPass()
        const result = processor.removePass(pass)

        expect(result).toBe(processor)
    })


    test('clearPasses', () => {
        const pass1 = new MockPass()
        const pass2 = new MockPass()
        processor.addPass(pass1)
        processor.addPass(pass2)
        vi.spyOn(pass1, 'dispose')
        vi.spyOn(pass2, 'dispose')

        const result = processor.clearPasses()

        expect(result).toBe(processor)
        expect(processor.passes).toEqual([])
        expect(pass1.dispose).toHaveBeenCalled()
        expect(pass2.dispose).toHaveBeenCalled()
    })


    test('resize', () => {
        const fbManager = processor.framebufferManager
        vi.spyOn(fbManager, 'resize')

        processor.resize(1024, 768)

        expect(fbManager.resize).toHaveBeenCalledWith(1024, 768)
    })


    test('hasActivePasses returns false when no passes', () => {
        expect(processor.hasActivePasses()).toBe(false)
    })


    test('hasActivePasses returns false when disabled', () => {
        const pass = new MockPass()
        processor.addPass(pass)
        processor.enabled = false

        expect(processor.hasActivePasses()).toBe(false)
    })


    test('hasActivePasses returns false when all passes disabled', () => {
        const pass = new MockPass()
        pass.enabled = false
        processor.addPass(pass)

        expect(processor.hasActivePasses()).toBe(false)
    })


    test('hasActivePasses returns true with active pass', () => {
        const pass = new MockPass()
        processor.addPass(pass)

        expect(processor.hasActivePasses()).toBe(true)
    })


    test('begin returns false when no active passes', () => {
        expect(processor.begin()).toBe(false)
    })


    test('begin returns true and binds scene buffer when active', () => {
        const pass = new MockPass()
        processor.addPass(pass)
        const fbManager = processor.framebufferManager
        vi.spyOn(fbManager, 'resetPingPong')
        vi.spyOn(fbManager, 'bindSceneBuffer')

        const result = processor.begin()

        expect(result).toBe(true)
        expect(fbManager.resetPingPong).toHaveBeenCalled()
        expect(fbManager.bindSceneBuffer).toHaveBeenCalled()
    })


    test('finish does nothing when no active passes', () => {
        processor.finish()
        expect(gl.disable).not.toHaveBeenCalled()
    })


    test('finish processes active passes', () => {
        const pass = new MockPass()
        processor.addPass(pass)
        vi.spyOn(pass, 'render')
        const fbManager = processor.framebufferManager
        vi.spyOn(fbManager, 'resolveSceneBuffer')
        vi.spyOn(fbManager, 'bindScreen')

        processor.finish()

        expect(fbManager.resolveSceneBuffer).toHaveBeenCalled()
        expect(gl.disable).toHaveBeenCalledWith(gl.BLEND)
        expect(fbManager.bindScreen).toHaveBeenCalled()
        expect(pass.render).toHaveBeenCalled()
        expect(gl.enable).toHaveBeenCalledWith(gl.BLEND)
    })


    test('finish with multiple passes uses ping-pong buffers', () => {
        const pass1 = new MockPass()
        const pass2 = new MockPass()
        processor.addPass(pass1)
        processor.addPass(pass2)
        const fbManager = processor.framebufferManager
        vi.spyOn(fbManager, 'bindPingPong')
        vi.spyOn(fbManager, 'swapAndGetTexture')
        vi.spyOn(fbManager, 'bindScreen')

        processor.finish()

        expect(fbManager.bindPingPong).toHaveBeenCalled()
        expect(fbManager.swapAndGetTexture).toHaveBeenCalled()
        expect(fbManager.bindScreen).toHaveBeenCalled()
    })


    test('finish skips disabled passes', () => {
        const pass1 = new MockPass()
        const pass2 = new MockPass()
        pass1.enabled = false
        processor.addPass(pass1)
        processor.addPass(pass2)
        vi.spyOn(pass1, 'render')
        vi.spyOn(pass2, 'render')

        processor.finish()

        expect(pass1.render).not.toHaveBeenCalled()
        expect(pass2.render).toHaveBeenCalled()
    })


    test('dispose', () => {
        const pass = new MockPass()
        processor.addPass(pass)
        vi.spyOn(pass, 'dispose')
        const fbManager = processor.framebufferManager
        vi.spyOn(fbManager, 'dispose')

        processor.dispose()

        expect(pass.dispose).toHaveBeenCalled()
        expect(fbManager.dispose).toHaveBeenCalled()
    })

})
