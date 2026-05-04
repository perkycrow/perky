import {describe, test, expect} from 'vitest'
import CubeShadowMap from './cube_shadow_map.js'


function createMockGL () {
    return {
        createTexture: () => 'mockTexture',
        bindTexture: () => {},
        texImage2D: () => {},
        texParameteri: () => {},
        createFramebuffer: () => 'mockFBO',
        bindFramebuffer: () => {},
        createRenderbuffer: () => 'mockRB',
        bindRenderbuffer: () => {},
        renderbufferStorage: () => {},
        framebufferRenderbuffer: () => {},
        framebufferTexture2D: () => {},
        viewport: () => {},
        drawBuffers: () => {},
        clearColor: () => {},
        clear: () => {},
        deleteFramebuffer: () => {},
        deleteTexture: () => {},
        deleteRenderbuffer: () => {},
        FRAMEBUFFER: 0x8D40,
        COLOR_ATTACHMENT0: 0x8CE0,
        DEPTH_ATTACHMENT: 0x8D00,
        TEXTURE_CUBE_MAP: 0x8513,
        TEXTURE_CUBE_MAP_POSITIVE_X: 0x8515,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        NEAREST: 0x2600,
        R32F: 0x822E,
        RED: 0x1903,
        FLOAT: 0x1406,
        RENDERBUFFER: 0x8D41,
        DEPTH_COMPONENT24: 0x81A6,
        COLOR_BUFFER_BIT: 0x4000,
        DEPTH_BUFFER_BIT: 0x100
    }
}


describe('CubeShadowMap', () => {

    test('constructor creates resources', () => {
        const gl = createMockGL()
        const csm = new CubeShadowMap({gl, resolution: 256})
        expect(csm.resolution).toBe(256)
        expect(csm.texture).toBe('mockTexture')
    })


    test('default resolution is 512', () => {
        const gl = createMockGL()
        const csm = new CubeShadowMap({gl})
        expect(csm.resolution).toBe(512)
    })


    test('dirty flag starts as true', () => {
        const gl = createMockGL()
        const csm = new CubeShadowMap({gl})
        expect(csm.dirty).toBe(true)
    })


    test('markDirty sets dirty to true', () => {
        const gl = createMockGL()
        const csm = new CubeShadowMap({gl})
        csm.markClean()
        expect(csm.dirty).toBe(false)
        csm.markDirty()
        expect(csm.dirty).toBe(true)
    })


    test('markClean sets dirty to false', () => {
        const gl = createMockGL()
        const csm = new CubeShadowMap({gl})
        csm.markClean()
        expect(csm.dirty).toBe(false)
    })


    test('update computes projection and views', () => {
        const gl = createMockGL()
        const csm = new CubeShadowMap({gl})
        const lightPosition = {x: 0, y: 5, z: 0}
        csm.update(lightPosition, 10)
        expect(csm.projection).toBeDefined()
        expect(csm.getView(0)).toBeDefined()
        expect(csm.getView(5)).toBeDefined()
    })


    test('dispose cleans up resources', () => {
        const gl = createMockGL()
        const csm = new CubeShadowMap({gl})
        csm.dispose()
        expect(csm.texture).toBe(null)
    })

})
