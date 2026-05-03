import SsaoEffect from './ssao_effect.js'


function createMockGL () {
    const calls = []
    return {
        TEXTURE_2D: 0x0DE1,
        TEXTURE0: 0x84C0,
        TEXTURE1: 0x84C1,
        FRAMEBUFFER: 0x8D40,
        COLOR_ATTACHMENT0: 0x8CE0,
        DEPTH_TEST: 0x0B71,
        RGBA8: 0x8058,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
        LINEAR: 0x2601,
        CLAMP_TO_EDGE: 0x812F,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        calls,
        createTexture () {
            return 'ssaoTex'
        },
        createFramebuffer () {
            return 'ssaoFBO'
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
        uniform1f () {},
        uniform2f () {},
        uniformMatrix4fv () {}
    }
}


function createMockShaderRegistry () {
    const mockProgram = {
        program: 'ssaoProgram',
        uniforms: {
            uDepth: 0,
            uGNormal: 1,
            uProjection: 2,
            uInverseViewProjection: 3,
            uView: 4,
            uTexelSize: 5,
            uRadius: 6,
            uBias: 7,
            uIntensity: 8,
            uSSAOTexture: 9
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
        gBuffer: {depthTexture: 'depthTex', normalTexture: 'normalTex'},
        camera3d: {
            projectionMatrix: {elements: new Float32Array(16)},
            viewMatrix: {elements: new Float32Array(16)}
        },
        inverseVP: {elements: new Float32Array(16)},
        fullscreenQuad: {draw () {}}
    }
}


test('default state', () => {
    const effect = new SsaoEffect()
    expect(effect.enabled).toBe(false)
    expect(effect.radius).toBe(0.5)
    expect(effect.bias).toBe(0.025)
    expect(effect.intensity).toBe(1.5)
    expect(effect.outputTexture).toBe(null)
})


test('getters and setters', () => {
    const effect = new SsaoEffect()
    effect.enabled = true
    effect.radius = 1.0
    effect.bias = 0.05
    effect.intensity = 2.0

    expect(effect.enabled).toBe(true)
    expect(effect.radius).toBe(1.0)
    expect(effect.bias).toBe(0.05)
    expect(effect.intensity).toBe(2.0)
})


test('render produces output texture', () => {
    const gl = createMockGL()
    const effect = new SsaoEffect()
    effect.init(createMockShaderRegistry())

    effect.render(gl, createMockCtx())

    expect(effect.outputTexture).toBe('ssaoTex')
})


test('dispose cleans up', () => {
    const gl = createMockGL()
    const effect = new SsaoEffect()
    effect.init(createMockShaderRegistry())
    effect.render(gl, createMockCtx())

    effect.dispose(gl)

    const delFBO = gl.calls.filter(c => c.fn === 'deleteFramebuffer')
    const delTex = gl.calls.filter(c => c.fn === 'deleteTexture')
    expect(delFBO.length).toBe(2)
    expect(delTex.length).toBe(2)
    expect(effect.outputTexture).toBe(null)
})
