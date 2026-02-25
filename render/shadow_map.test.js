import ShadowMap from './shadow_map.js'
import Camera3D from './camera_3d.js'
import Matrix4 from '../math/matrix4.js'


function createMockGL () {
    const calls = []
    return {
        TEXTURE_2D: 0x0DE1,
        DEPTH_COMPONENT24: 0x81A6,
        DEPTH_COMPONENT: 0x1902,
        UNSIGNED_INT: 0x1405,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        LINEAR: 0x2601,
        CLAMP_TO_EDGE: 0x812F,
        TEXTURE_COMPARE_MODE: 0x884C,
        COMPARE_REF_TO_TEXTURE: 0x884E,
        TEXTURE_COMPARE_FUNC: 0x884D,
        LEQUAL: 0x0203,
        FRAMEBUFFER: 0x8D40,
        DEPTH_ATTACHMENT: 0x8D00,
        NONE: 0,
        DEPTH_BUFFER_BIT: 0x00000100,
        calls,
        createTexture () {
            calls.push({fn: 'createTexture'})
            return 'depthTex'
        },
        bindTexture (target, tex) {
            calls.push({fn: 'bindTexture', args: [target, tex]})
        },
        texImage2D (...args) {
            calls.push({fn: 'texImage2D', args})
        },
        texParameteri (...args) {
            calls.push({fn: 'texParameteri', args})
        },
        createFramebuffer () {
            calls.push({fn: 'createFramebuffer'})
            return 'shadowFBO'
        },
        bindFramebuffer (target, fb) {
            calls.push({fn: 'bindFramebuffer', args: [target, fb]})
        },
        framebufferTexture2D (...args) {
            calls.push({fn: 'framebufferTexture2D', args})
        },
        drawBuffers (buffers) {
            calls.push({fn: 'drawBuffers', args: [buffers]})
        },
        readBuffer (buf) {
            calls.push({fn: 'readBuffer', args: [buf]})
        },
        viewport (...args) {
            calls.push({fn: 'viewport', args})
        },
        clear (mask) {
            calls.push({fn: 'clear', args: [mask]})
        },
        deleteFramebuffer (fb) {
            calls.push({fn: 'deleteFramebuffer', args: [fb]})
        },
        deleteTexture (tex) {
            calls.push({fn: 'deleteTexture', args: [tex]})
        }
    }
}


describe('ShadowMap', () => {

    test('creates depth framebuffer on construction', () => {
        const gl = createMockGL()
        const sm = new ShadowMap({gl})
        expect(sm.texture).toBe('depthTex')
        expect(sm.resolution).toBe(1024)
        const fboCalls = gl.calls.filter(c => c.fn === 'createFramebuffer')
        expect(fboCalls.length).toBe(1)
    })


    test('custom resolution', () => {
        const gl = createMockGL()
        const sm = new ShadowMap({gl, resolution: 2048})
        expect(sm.resolution).toBe(2048)
    })


    test('configures depth texture with compare mode', () => {
        const gl = createMockGL()
        new ShadowMap({gl})
        const compareCalls = gl.calls.filter(
            c => c.fn === 'texParameteri' && c.args[1] === gl.TEXTURE_COMPARE_MODE
        )
        expect(compareCalls.length).toBe(1)
        expect(compareCalls[0].args[2]).toBe(gl.COMPARE_REF_TO_TEXTURE)
    })


    test('disables color output on framebuffer', () => {
        const gl = createMockGL()
        new ShadowMap({gl})
        const drawCalls = gl.calls.filter(c => c.fn === 'drawBuffers')
        expect(drawCalls.length).toBe(1)
        expect(drawCalls[0].args[0]).toEqual([gl.NONE])
    })


    test('update computes light matrix', () => {
        const gl = createMockGL()
        const sm = new ShadowMap({gl})
        const cam = new Camera3D({x: 0, y: 1, z: 0})
        sm.update([0, 1, 0], cam, 10)
        expect(sm.lightMatrix).toBeInstanceOf(Matrix4)
        expect(sm.lightMatrix.elements[15]).not.toBe(0)
    })


    test('begin binds framebuffer and sets viewport', () => {
        const gl = createMockGL()
        const sm = new ShadowMap({gl, resolution: 512})
        gl.calls.length = 0
        sm.begin()
        const bindCalls = gl.calls.filter(c => c.fn === 'bindFramebuffer')
        expect(bindCalls.length).toBe(1)
        expect(bindCalls[0].args[1]).toBe('shadowFBO')
        const vpCalls = gl.calls.filter(c => c.fn === 'viewport')
        expect(vpCalls.length).toBe(1)
        expect(vpCalls[0].args).toEqual([0, 0, 512, 512])
    })


    test('end unbinds framebuffer', () => {
        const gl = createMockGL()
        const sm = new ShadowMap({gl})
        gl.calls.length = 0
        sm.end()
        const bindCalls = gl.calls.filter(c => c.fn === 'bindFramebuffer')
        expect(bindCalls.length).toBe(1)
        expect(bindCalls[0].args[1]).toBe(null)
    })


    test('dispose cleans up resources', () => {
        const gl = createMockGL()
        const sm = new ShadowMap({gl})
        gl.calls.length = 0
        sm.dispose()
        const deleteFBOs = gl.calls.filter(c => c.fn === 'deleteFramebuffer')
        expect(deleteFBOs.length).toBe(1)
        const deleteTexs = gl.calls.filter(c => c.fn === 'deleteTexture')
        expect(deleteTexs.length).toBe(1)
        expect(sm.texture).toBe(null)
    })

})
