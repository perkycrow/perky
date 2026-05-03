import OutlineEffect from './outline_effect.js'


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
            return 'outlineTex'
        },
        createFramebuffer () {
            return 'outlineFBO'
        },
        deleteTexture (t) {
            calls.push({fn: 'deleteTexture', args: [t]})
        },
        deleteFramebuffer (f) {
            calls.push({fn: 'deleteFramebuffer', args: [f]})
        },
        bindTexture () {
            calls.push('bindTexture')
        },
        texImage2D () {},
        texParameteri () {},
        useProgram () {
            calls.push('useProgram')
        },
        bindFramebuffer () {
            calls.push('bindFramebuffer')
        },
        framebufferTexture2D () {},
        viewport () {},
        enable () {},
        disable () {},
        activeTexture () {},
        uniform1i () {},
        uniform1f () {},
        uniform2f () {},
        uniform3fv () {}
    }
}


function createMockShaderRegistry () {
    return {
        register () {
            return {
                program: 'outlineProgram',
                uniforms: {
                    uSceneColor: 0,
                    uDepth: 1,
                    uGNormal: 2,
                    uTexelSize: 3,
                    uOutlineColor: 4,
                    uDepthThreshold: 5,
                    uNormalThreshold: 6
                },
                attributes: {aPosition: 0, aTexCoord: 1}
            }
        }
    }
}


test('default state', () => {
    const effect = new OutlineEffect()
    expect(effect.enabled).toBe(false)
    expect(effect.color).toEqual([0.0, 0.0, 0.0])
    expect(effect.depthThreshold).toBe(0.001)
    expect(effect.normalThreshold).toBe(0.3)
})


test('getters and setters', () => {
    const effect = new OutlineEffect()
    effect.enabled = true
    effect.color = [1, 0, 0]
    effect.depthThreshold = 0.01
    effect.normalThreshold = 0.5

    expect(effect.enabled).toBe(true)
    expect(effect.color).toEqual([1, 0, 0])
    expect(effect.depthThreshold).toBe(0.01)
    expect(effect.normalThreshold).toBe(0.5)
})


test('render returns output texture', () => {
    const gl = createMockGL()
    const effect = new OutlineEffect()
    effect.init(createMockShaderRegistry())

    const ctx = {
        canvasWidth: 800,
        canvasHeight: 600,
        gBuffer: {depthTexture: 'depthTex', normalTexture: 'normalTex'},
        fullscreenQuad: {draw () {}}
    }

    const result = effect.render(gl, ctx, 'sceneTex')
    expect(result).toBe('outlineTex')
})


test('dispose cleans up', () => {
    const gl = createMockGL()
    const effect = new OutlineEffect()
    effect.init(createMockShaderRegistry())

    const ctx = {
        canvasWidth: 800,
        canvasHeight: 600,
        gBuffer: {depthTexture: 'depthTex', normalTexture: 'normalTex'},
        fullscreenQuad: {draw () {}}
    }
    effect.render(gl, ctx, 'sceneTex')

    gl.calls.length = 0
    effect.dispose(gl)

    const delFBO = gl.calls.filter(c => c.fn === 'deleteFramebuffer')
    const delTex = gl.calls.filter(c => c.fn === 'deleteTexture')
    expect(delFBO.length).toBe(1)
    expect(delTex.length).toBe(1)
})
