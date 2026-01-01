import {describe, test, expect, beforeEach, vi} from 'vitest'
import RenderGroup, {BLEND_MODES} from './render_group.js'
import PerkyModule from '../core/perky_module.js'


class MockRenderPass {
    constructor () {
        this.enabled = true
        this.initCalled = false
        this.disposed = false
    }

    init (shaderRegistry) {
        this.initCalled = true
        this.shaderRegistry = shaderRegistry
    }

    dispose () {
        this.disposed = true
    }
}


class MockRenderer extends PerkyModule {
    constructor () {
        super()
        this.gl = {}
        this.shaderRegistry = {
            register: vi.fn()
        }
        this.postProcessor = {
            framebufferManager: {
                getOrCreateBuffer: vi.fn()
            }
        }
    }
}


describe('RenderGroup', () => {

    let renderGroup

    beforeEach(() => {
        renderGroup = new RenderGroup()
    })


    describe('BLEND_MODES', () => {

        test('exports normal blend mode', () => {
            expect(BLEND_MODES.normal).toBe('normal')
        })


        test('exports additive blend mode', () => {
            expect(BLEND_MODES.additive).toBe('additive')
        })


        test('exports multiply blend mode', () => {
            expect(BLEND_MODES.multiply).toBe('multiply')
        })

    })


    describe('static properties', () => {

        test('has $category of renderGroup', () => {
            expect(RenderGroup.$category).toBe('renderGroup')
        })


        test('has $name of renderGroup', () => {
            expect(RenderGroup.$name).toBe('renderGroup')
        })

    })


    describe('constructor', () => {

        test('content defaults to null', () => {
            expect(renderGroup.content).toBeNull()
        })


        test('postPasses defaults to empty array', () => {
            expect(renderGroup.postPasses).toEqual([])
        })


        test('blendMode defaults to normal', () => {
            expect(renderGroup.blendMode).toBe(BLEND_MODES.normal)
        })


        test('visible defaults to true', () => {
            expect(renderGroup.visible).toBe(true)
        })


        test('opacity defaults to 1', () => {
            expect(renderGroup.opacity).toBe(1)
        })


        test('accepts custom content', () => {
            const content = {name: 'test-content'}
            const group = new RenderGroup({content})

            expect(group.content).toBe(content)
        })


        test('accepts custom postPasses', () => {
            const pass = new MockRenderPass()
            const group = new RenderGroup({postPasses: [pass]})

            expect(group.postPasses).toContain(pass)
        })


        test('accepts custom blendMode', () => {
            const group = new RenderGroup({blendMode: BLEND_MODES.additive})

            expect(group.blendMode).toBe(BLEND_MODES.additive)
        })


        test('accepts custom visibility', () => {
            const group = new RenderGroup({visible: false})

            expect(group.visible).toBe(false)
        })


        test('accepts custom opacity', () => {
            const group = new RenderGroup({opacity: 0.5})

            expect(group.opacity).toBe(0.5)
        })

    })


    describe('onInstall', () => {

        test('does nothing without valid renderer', () => {
            expect(() => renderGroup.onInstall()).not.toThrow()
        })


        test('initializes passes when renderer has gl and shaderRegistry', () => {
            const pass = new MockRenderPass()
            const renderer = new MockRenderer()

            renderer.create(RenderGroup, {$id: 'test', postPasses: [pass]})

            const installedGroup = renderer.getChild('test')
            expect(installedGroup.postPasses[0].initCalled).toBe(true)
        })


        test('creates framebuffer for the group', () => {
            const renderer = new MockRenderer()

            renderer.create(RenderGroup, {$id: 'test'})

            expect(renderer.postProcessor.framebufferManager.getOrCreateBuffer)
                .toHaveBeenCalledWith('renderGroup')
        })


        test('handles missing postProcessor gracefully', () => {
            class MinimalRenderer extends PerkyModule {
                constructor () {
                    super()
                    this.gl = {}
                    this.shaderRegistry = {}
                }
            }

            const renderer = new MinimalRenderer()
            expect(() => renderer.create(RenderGroup, {$id: 'test'})).not.toThrow()
        })

    })


    describe('hasActivePasses', () => {

        test('returns false when no passes', () => {
            expect(renderGroup.hasActivePasses()).toBe(false)
        })


        test('returns true when at least one pass is enabled', () => {
            const pass = new MockRenderPass()
            pass.enabled = true
            renderGroup.postPasses = [pass]

            expect(renderGroup.hasActivePasses()).toBe(true)
        })


        test('returns false when all passes are disabled', () => {
            const pass1 = new MockRenderPass()
            const pass2 = new MockRenderPass()
            pass1.enabled = false
            pass2.enabled = false
            renderGroup.postPasses = [pass1, pass2]

            expect(renderGroup.hasActivePasses()).toBe(false)
        })

    })


    describe('addPostPass', () => {

        test('adds pass to postPasses array', () => {
            const pass = new MockRenderPass()
            renderGroup.addPostPass(pass)

            expect(renderGroup.postPasses).toContain(pass)
        })


        test('returns this for chaining', () => {
            const pass = new MockRenderPass()
            const result = renderGroup.addPostPass(pass)

            expect(result).toBe(renderGroup)
        })


        test('emits postPass:added event', () => {
            const handler = vi.fn()
            renderGroup.on('postPass:added', handler)

            const pass = new MockRenderPass()
            renderGroup.addPostPass(pass)

            expect(handler).toHaveBeenCalledWith(pass)
        })


        test('initializes pass if already installed in renderer', () => {
            const renderer = new MockRenderer()
            const group = renderer.create(RenderGroup, {$id: 'test-group'})

            const pass = new MockRenderPass()
            group.addPostPass(pass)

            expect(pass.initCalled).toBe(true)
        })

    })


    describe('removePostPass', () => {

        test('removes pass from postPasses array', () => {
            const pass = new MockRenderPass()
            renderGroup.postPasses = [pass]

            renderGroup.removePostPass(pass)

            expect(renderGroup.postPasses).not.toContain(pass)
        })


        test('disposes the removed pass', () => {
            const pass = new MockRenderPass()
            renderGroup.postPasses = [pass]

            renderGroup.removePostPass(pass)

            expect(pass.disposed).toBe(true)
        })


        test('returns this for chaining', () => {
            const pass = new MockRenderPass()
            renderGroup.postPasses = [pass]

            const result = renderGroup.removePostPass(pass)

            expect(result).toBe(renderGroup)
        })


        test('emits postPass:removed event', () => {
            const handler = vi.fn()
            renderGroup.on('postPass:removed', handler)

            const pass = new MockRenderPass()
            renderGroup.postPasses = [pass]
            renderGroup.removePostPass(pass)

            expect(handler).toHaveBeenCalledWith(pass)
        })


        test('does nothing for unknown pass', () => {
            const pass1 = new MockRenderPass()
            const pass2 = new MockRenderPass()
            renderGroup.postPasses = [pass1]

            renderGroup.removePostPass(pass2)

            expect(renderGroup.postPasses).toContain(pass1)
            expect(pass2.disposed).toBe(false)
        })

    })


    describe('onDispose', () => {

        test('disposes all passes', () => {
            const pass1 = new MockRenderPass()
            const pass2 = new MockRenderPass()
            renderGroup.postPasses = [pass1, pass2]

            renderGroup.onDispose()

            expect(pass1.disposed).toBe(true)
            expect(pass2.disposed).toBe(true)
        })


        test('clears postPasses array', () => {
            const pass = new MockRenderPass()
            renderGroup.postPasses = [pass]

            renderGroup.onDispose()

            expect(renderGroup.postPasses).toEqual([])
        })

    })

})
