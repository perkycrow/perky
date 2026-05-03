import SmaaEffect from './smaa_effect.js'


function createMockGL () {
    const calls = []
    return {
        TEXTURE_2D: 0x0DE1,
        TEXTURE0: 0x84C0,
        TEXTURE1: 0x84C1,
        TEXTURE2: 0x84C2,
        FRAMEBUFFER: 0x8D40,
        COLOR_ATTACHMENT0: 0x8CE0,
        DEPTH_TEST: 0x0B71,
        COLOR_BUFFER_BIT: 0x4000,
        RGBA8: 0x8058,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
        LINEAR: 0x2601,
        NEAREST: 0x2600,
        CLAMP_TO_EDGE: 0x812F,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        calls,
        createTexture () {
            return 'smaaTex'
        },
        createFramebuffer () {
            return 'smaaFBO'
        },
        deleteTexture (t) {
            calls.push({fn: 'deleteTexture', args: [t]})
        },
        deleteFramebuffer (f) {
            calls.push({fn: 'deleteFramebuffer', args: [f]})
        },
        bindTexture () {},
        texImage2D () {},
        texParameteri () {},
        useProgram () {},
        bindFramebuffer () {},
        framebufferTexture2D () {},
        viewport () {},
        enable () {},
        disable () {},
        activeTexture () {},
        uniform1i () {},
        uniform2f () {},
        clearColor () {},
        clear () {}
    }
}


function createMockShaderRegistry () {
    const mockProgram = {
        program: 'smaaProgram',
        uniforms: {
            uColorTexture: 0,
            uTexelSize: 1,
            uEdgesTexture: 2,
            uAreaTexture: 3,
            uSearchTexture: 4,
            uViewportSize: 5,
            uBlendTexture: 6
        },
        attributes: {aPosition: 0, aTexCoord: 1}
    }
    return {
        register () {
            return mockProgram
        }
    }
}


function createMockCtx () {
    return {
        canvasWidth: 800,
        canvasHeight: 600,
        fullscreenQuad: {draw () {}}
    }
}


test('default state', () => {
    const effect = new SmaaEffect()
    expect(effect.enabled).toBe(true)
    expect(effect.ready).toBe(false)
})


test('getters and setters', () => {
    const effect = new SmaaEffect()
    effect.enabled = false
    expect(effect.enabled).toBe(false)
})


test('render returns output texture', () => {
    const gl = createMockGL()
    const effect = new SmaaEffect()
    effect.init(createMockShaderRegistry(), gl)

    const result = effect.render(gl, createMockCtx(), 'inputTex')
    expect(result).toBe('smaaTex')
})


test('dispose cleans up FBOs', () => {
    const gl = createMockGL()
    const effect = new SmaaEffect()
    effect.init(createMockShaderRegistry(), gl)
    effect.render(gl, createMockCtx(), 'inputTex')

    gl.calls.length = 0
    effect.dispose(gl)

    const delFBO = gl.calls.filter(c => c.fn === 'deleteFramebuffer')
    const delTex = gl.calls.filter(c => c.fn === 'deleteTexture')
    expect(delFBO.length).toBe(3)
    expect(delTex.length).toBe(3)
    expect(effect.ready).toBe(false)
})


test('blendProgram is accessible', () => {
    const gl = createMockGL()
    const registry = createMockShaderRegistry()
    const effect = new SmaaEffect()
    effect.init(registry, gl)
    expect(effect.blendProgram).toBeDefined()
})
