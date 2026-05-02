import GBuffer from './g_buffer.js'


function createMockGL () {
    const calls = []
    let textureCount = 0
    return {
        TEXTURE_2D: 0x0DE1,
        RGBA8: 0x8058,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
        DEPTH_COMPONENT24: 0x81A6,
        DEPTH_COMPONENT: 0x1902,
        UNSIGNED_INT: 0x1405,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        NEAREST: 0x2600,
        CLAMP_TO_EDGE: 0x812F,
        FRAMEBUFFER: 0x8D40,
        FRAMEBUFFER_COMPLETE: 0x8CD5,
        COLOR_ATTACHMENT0: 0x8CE0,
        COLOR_ATTACHMENT1: 0x8CE1,
        COLOR_ATTACHMENT2: 0x8CE2,
        DEPTH_ATTACHMENT: 0x8D00,
        COLOR_BUFFER_BIT: 0x00004000,
        DEPTH_BUFFER_BIT: 0x00000100,
        calls,
        createTexture () {
            textureCount++
            calls.push({fn: 'createTexture'})
            return `texture_${textureCount}`
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
            return 'gbufferFBO'
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
        checkFramebufferStatus () {
            return 0x8CD5
        },
        viewport (...args) {
            calls.push({fn: 'viewport', args})
        },
        clear (mask) {
            calls.push({fn: 'clear', args: [mask]})
        },
        clearColor (...args) {
            calls.push({fn: 'clearColor', args})
        },
        deleteFramebuffer (fb) {
            calls.push({fn: 'deleteFramebuffer', args: [fb]})
        },
        deleteTexture (tex) {
            calls.push({fn: 'deleteTexture', args: [tex]})
        },
        READ_FRAMEBUFFER: 0x8CA8,
        DRAW_FRAMEBUFFER: 0x8CA9,
        NEAREST: 0x2600,
        blitFramebuffer (...args) {
            calls.push({fn: 'blitFramebuffer', args})
        }
    }
}


describe('GBuffer', () => {

    test('creates 4 textures and a framebuffer', () => {
        const gl = createMockGL()
        const gb = new GBuffer({gl, width: 800, height: 600})
        const texCalls = gl.calls.filter(c => c.fn === 'createTexture')
        expect(texCalls.length).toBe(4)
        const fboCalls = gl.calls.filter(c => c.fn === 'createFramebuffer')
        expect(fboCalls.length).toBe(1)
        expect(gb.albedoTexture).toBe('texture_1')
        expect(gb.normalTexture).toBe('texture_2')
        expect(gb.materialTexture).toBe('texture_3')
        expect(gb.depthTexture).toBe('texture_4')
    })


    test('width and height', () => {
        const gl = createMockGL()
        const gb = new GBuffer({gl, width: 1920, height: 1080})
        expect(gb.width).toBe(1920)
        expect(gb.height).toBe(1080)
    })


    test('attaches 3 color targets and depth', () => {
        const gl = createMockGL()
        new GBuffer({gl, width: 800, height: 600})
        const attachCalls = gl.calls.filter(c => c.fn === 'framebufferTexture2D')
        expect(attachCalls.length).toBe(4)
        expect(attachCalls[0].args[1]).toBe(gl.COLOR_ATTACHMENT0)
        expect(attachCalls[1].args[1]).toBe(gl.COLOR_ATTACHMENT1)
        expect(attachCalls[2].args[1]).toBe(gl.COLOR_ATTACHMENT2)
        expect(attachCalls[3].args[1]).toBe(gl.DEPTH_ATTACHMENT)
    })


    test('sets draw buffers for MRT', () => {
        const gl = createMockGL()
        new GBuffer({gl, width: 800, height: 600})
        const drawCalls = gl.calls.filter(c => c.fn === 'drawBuffers')
        expect(drawCalls.length).toBe(1)
        expect(drawCalls[0].args[0]).toEqual([
            gl.COLOR_ATTACHMENT0,
            gl.COLOR_ATTACHMENT1,
            gl.COLOR_ATTACHMENT2
        ])
    })


    test('color textures use NEAREST filtering', () => {
        const gl = createMockGL()
        new GBuffer({gl, width: 800, height: 600})
        const filterCalls = gl.calls.filter(
            c => c.fn === 'texParameteri' && c.args[1] === gl.TEXTURE_MIN_FILTER
        )
        for (const call of filterCalls) {
            expect(call.args[2]).toBe(gl.NEAREST)
        }
    })


    test('begin binds framebuffer and clears', () => {
        const gl = createMockGL()
        const gb = new GBuffer({gl, width: 800, height: 600})
        gl.calls.length = 0
        gb.begin()
        const bindCalls = gl.calls.filter(c => c.fn === 'bindFramebuffer')
        expect(bindCalls.length).toBe(1)
        expect(bindCalls[0].args[1]).toBe('gbufferFBO')
        const vpCalls = gl.calls.filter(c => c.fn === 'viewport')
        expect(vpCalls[0].args).toEqual([0, 0, 800, 600])
        const clearCalls = gl.calls.filter(c => c.fn === 'clear')
        expect(clearCalls.length).toBe(1)
        expect(clearCalls[0].args[0]).toBe(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    })


    test('begin sets draw buffers for MRT', () => {
        const gl = createMockGL()
        const gb = new GBuffer({gl, width: 800, height: 600})
        gl.calls.length = 0
        gb.begin()
        const drawCalls = gl.calls.filter(c => c.fn === 'drawBuffers')
        expect(drawCalls.length).toBe(1)
        expect(drawCalls[0].args[0]).toEqual([
            gl.COLOR_ATTACHMENT0,
            gl.COLOR_ATTACHMENT1,
            gl.COLOR_ATTACHMENT2
        ])
    })


    test('end resets draw buffers and unbinds', () => {
        const gl = createMockGL()
        const gb = new GBuffer({gl, width: 800, height: 600})
        gl.calls.length = 0
        gb.end()
        const drawCalls = gl.calls.filter(c => c.fn === 'drawBuffers')
        expect(drawCalls.length).toBe(1)
        expect(drawCalls[0].args[0]).toEqual([gl.COLOR_ATTACHMENT0])
        const bindCalls = gl.calls.filter(c => c.fn === 'bindFramebuffer')
        expect(bindCalls[0].args[1]).toBe(null)
    })


    test('resize recreates resources', () => {
        const gl = createMockGL()
        const gb = new GBuffer({gl, width: 800, height: 600})
        gl.calls.length = 0
        gb.resize(1920, 1080)
        expect(gb.width).toBe(1920)
        expect(gb.height).toBe(1080)
        const deleteCalls = gl.calls.filter(c => c.fn === 'deleteTexture')
        expect(deleteCalls.length).toBe(4)
        const createCalls = gl.calls.filter(c => c.fn === 'createTexture')
        expect(createCalls.length).toBe(4)
    })


    test('resize skips when same size', () => {
        const gl = createMockGL()
        const gb = new GBuffer({gl, width: 800, height: 600})
        gl.calls.length = 0
        gb.resize(800, 600)
        expect(gl.calls.length).toBe(0)
    })


    test('dispose cleans up all resources', () => {
        const gl = createMockGL()
        const gb = new GBuffer({gl, width: 800, height: 600})
        gl.calls.length = 0
        gb.dispose()
        const deleteFBOs = gl.calls.filter(c => c.fn === 'deleteFramebuffer')
        expect(deleteFBOs.length).toBe(1)
        const deleteTexs = gl.calls.filter(c => c.fn === 'deleteTexture')
        expect(deleteTexs.length).toBe(4)
    })


    test('dispose is safe to call twice', () => {
        const gl = createMockGL()
        const gb = new GBuffer({gl, width: 800, height: 600})
        gb.dispose()
        expect(() => gb.dispose()).not.toThrow()
    })


    test('throws on incomplete framebuffer', () => {
        const gl = createMockGL()
        gl.checkFramebufferStatus = () => 0
        expect(() => new GBuffer({gl, width: 800, height: 600})).toThrow(/not complete/)
    })


    test('blitDepthTo copies depth to target framebuffer', () => {
        const gl = createMockGL()
        const gb = new GBuffer({gl, width: 800, height: 600})
        gl.calls.length = 0
        gb.blitDepthTo(null)
        const bindCalls = gl.calls.filter(c => c.fn === 'bindFramebuffer')
        expect(bindCalls[0].args).toEqual([gl.READ_FRAMEBUFFER, 'gbufferFBO'])
        expect(bindCalls[1].args).toEqual([gl.DRAW_FRAMEBUFFER, null])
        const blitCalls = gl.calls.filter(c => c.fn === 'blitFramebuffer')
        expect(blitCalls.length).toBe(1)
        expect(blitCalls[0].args).toEqual([0, 0, 800, 600, 0, 0, 800, 600, gl.DEPTH_BUFFER_BIT, gl.NEAREST])
        expect(bindCalls[2].args).toEqual([gl.READ_FRAMEBUFFER, null])
        expect(bindCalls[3].args).toEqual([gl.DRAW_FRAMEBUFFER, null])
    })

})
