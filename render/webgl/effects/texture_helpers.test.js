import {createScreenTexture, createHdrTexture, createFBO} from './texture_helpers.js'


function createMockGL () {
    const calls = []
    return {
        TEXTURE_2D: 0x0DE1,
        RGBA8: 0x8058,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
        RGBA16F: 0x881A,
        HALF_FLOAT: 0x140B,
        LINEAR: 0x2601,
        CLAMP_TO_EDGE: 0x812F,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        FRAMEBUFFER: 0x8D40,
        COLOR_ATTACHMENT0: 0x8CE0,
        calls,
        createTexture () {
            calls.push('createTexture')
            return 'tex'
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
            calls.push('createFramebuffer')
            return 'fbo'
        },
        bindFramebuffer (target, fb) {
            calls.push({fn: 'bindFramebuffer', args: [target, fb]})
        },
        framebufferTexture2D (...args) {
            calls.push({fn: 'framebufferTexture2D', args})
        }
    }
}


test('createScreenTexture', () => {
    const gl = createMockGL()
    const tex = createScreenTexture(gl, 800, 600)
    expect(tex).toBe('tex')

    const texImage = gl.calls.find(c => c.fn === 'texImage2D')
    expect(texImage.args[2]).toBe(gl.RGBA8)
    expect(texImage.args[3]).toBe(800)
    expect(texImage.args[4]).toBe(600)

    const unbind = gl.calls.filter(c => c.fn === 'bindTexture' && c.args[1] === null)
    expect(unbind.length).toBe(1)
})


test('createHdrTexture', () => {
    const gl = createMockGL()
    const tex = createHdrTexture(gl, 400, 300)
    expect(tex).toBe('tex')

    const texImage = gl.calls.find(c => c.fn === 'texImage2D')
    expect(texImage.args[2]).toBe(gl.RGBA16F)
    expect(texImage.args[3]).toBe(400)
    expect(texImage.args[4]).toBe(300)
})


test('createFBO', () => {
    const gl = createMockGL()
    const fbo = createFBO(gl, 'myTexture')
    expect(fbo).toBe('fbo')

    const attach = gl.calls.find(c => c.fn === 'framebufferTexture2D')
    expect(attach.args[3]).toBe('myTexture')

    const unbind = gl.calls.filter(c => c.fn === 'bindFramebuffer' && c.args[1] === null)
    expect(unbind.length).toBe(1)
})
