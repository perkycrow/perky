import BloomEffect from './bloom_effect.js'


function createMockGL () {
    const calls = []
    return {
        TEXTURE_2D: 0x0DE1, TEXTURE0: 0x84C0, FRAMEBUFFER: 0x8D40,
        COLOR_ATTACHMENT0: 0x8CE0, DEPTH_TEST: 0x0B71, BLEND: 0x0BE2,
        CONSTANT_COLOR: 0x8001, ONE: 1,
        RGBA8: 0x8058, RGBA: 0x1908, UNSIGNED_BYTE: 0x1401,
        LINEAR: 0x2601, CLAMP_TO_EDGE: 0x812F,
        TEXTURE_MIN_FILTER: 0x2801, TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802, TEXTURE_WRAP_T: 0x2803,
        calls,
        createTexture () { return 'bloomTex' },
        createFramebuffer () { return 'bloomFBO' },
        deleteTexture (t) { calls.push({fn: 'deleteTexture', args: [t]}) },
        deleteFramebuffer (f) { calls.push({fn: 'deleteFramebuffer', args: [f]}) },
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
        blendColor () {},
        blendFunc () {}
    }
}


function createMockShaderRegistry () {
    const mockProgram = {
        program: 'bloomProgram',
        uniforms: {
            uSceneColor: 0, uThreshold: 1, uSoftThreshold: 2,
            uTexture: 3, uTexelSize: 4, uDirection: 5
        },
        attributes: {aPosition: 0, aTexCoord: 1}
    }
    return {
        register () { return mockProgram }
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
    const effect = new BloomEffect()
    expect(effect.enabled).toBe(false)
    expect(effect.threshold).toBe(0.8)
    expect(effect.softThreshold).toBe(0.5)
    expect(effect.intensity).toBe(0.3)
    expect(effect.passes).toBe(2)
})


test('getters and setters', () => {
    const effect = new BloomEffect()
    effect.enabled = true
    effect.threshold = 0.5
    effect.softThreshold = 0.3
    effect.intensity = 0.6
    effect.passes = 3

    expect(effect.enabled).toBe(true)
    expect(effect.threshold).toBe(0.5)
    expect(effect.softThreshold).toBe(0.3)
    expect(effect.intensity).toBe(0.6)
    expect(effect.passes).toBe(3)
})


test('render runs without error', () => {
    const gl = createMockGL()
    const effect = new BloomEffect()
    effect.init(createMockShaderRegistry())

    effect.render(gl, createMockCtx(), 'sceneTex')
})


test('composite runs without error', () => {
    const gl = createMockGL()
    const effect = new BloomEffect()
    effect.init(createMockShaderRegistry())
    effect.render(gl, createMockCtx(), 'sceneTex')

    effect.composite(gl, createMockCtx())
})


test('dispose cleans up FBOs', () => {
    const gl = createMockGL()
    const effect = new BloomEffect()
    effect.init(createMockShaderRegistry())
    effect.render(gl, createMockCtx(), 'sceneTex')

    effect.dispose(gl)

    const delFBO = gl.calls.filter(c => c.fn === 'deleteFramebuffer')
    const delTex = gl.calls.filter(c => c.fn === 'deleteTexture')
    expect(delFBO.length).toBe(3)
    expect(delTex.length).toBe(3)
})
