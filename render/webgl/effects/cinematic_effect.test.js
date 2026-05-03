import CinematicEffect from './cinematic_effect.js'


function createMockGL () {
    const calls = []
    return {
        TEXTURE_2D: 0x0DE1,
        TEXTURE0: 0x84C0,
        TEXTURE1: 0x84C1,
        FRAMEBUFFER: 0x8D40,
        DEPTH_TEST: 0x0B71,
        LUMINANCE: 0x1909,
        UNSIGNED_BYTE: 0x1401,
        LINEAR: 0x2601,
        REPEAT: 0x2901,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        calls,
        createTexture () {
            calls.push('createTexture')
            return 'paperTex'
        },
        deleteTexture (tex) {
            calls.push({fn: 'deleteTexture', args: [tex]})
        },
        bindTexture () {
            calls.push('bindTexture')
        },
        texImage2D () {
            calls.push('texImage2D')
        },
        texParameteri () {
            calls.push('texParameteri')
        },
        useProgram () {
            calls.push('useProgram')
        },
        bindFramebuffer () {
            calls.push('bindFramebuffer')
        },
        viewport () {
            calls.push('viewport')
        },
        enable () {
            calls.push('enable')
        },
        disable () {
            calls.push('disable')
        },
        activeTexture () {
            calls.push('activeTexture')
        },
        uniform1i () {
            calls.push('uniform1i')
        },
        uniform1f () {
            calls.push('uniform1f')
        }
    }
}


function createMockShaderRegistry () {
    const mockProgram = {
        program: 'cinematicProgram',
        uniforms: {
            uSceneColor: 0,
            uTime: 1,
            uVignetteIntensity: 2,
            uVignetteSmoothness: 3,
            uSaturation: 4,
            uTemperature: 5,
            uBrightness: 6,
            uContrast: 7,
            uGrainIntensity: 8,
            uPaperIntensity: 9,
            uColorLevels: 10,
            uPaperTexture: 11
        },
        attributes: {aPosition: 0, aTexCoord: 1}
    }
    return {
        register () {
            return mockProgram
        },
        mockProgram
    }
}


function createMockCtx () {
    return {
        canvasWidth: 800,
        canvasHeight: 600,
        fullscreenQuad: {
            draw () {}
        }
    }
}


test('default state', () => {
    const effect = new CinematicEffect()
    expect(effect.enabled).toBe(false)
    expect(effect.saturation).toBe(1.0)
    expect(effect.brightness).toBe(1.0)
    expect(effect.contrast).toBe(1.0)
    expect(effect.temperature).toBe(0.0)
    expect(effect.vignetteIntensity).toBe(0.4)
    expect(effect.vignetteSmoothness).toBe(0.8)
    expect(effect.grainIntensity).toBe(0.0)
    expect(effect.colorLevels).toBe(0)
    expect(effect.paperIntensity).toBe(0.0)
})


test('getters and setters', () => {
    const effect = new CinematicEffect()
    effect.enabled = true
    effect.saturation = 0.8
    effect.temperature = -0.3
    effect.brightness = 1.2
    effect.contrast = 1.1
    effect.vignetteIntensity = 0.6
    effect.vignetteSmoothness = 0.5
    effect.grainIntensity = 0.05
    effect.colorLevels = 8
    effect.paperIntensity = 0.15

    expect(effect.enabled).toBe(true)
    expect(effect.saturation).toBe(0.8)
    expect(effect.temperature).toBe(-0.3)
    expect(effect.brightness).toBe(1.2)
    expect(effect.contrast).toBe(1.1)
    expect(effect.vignetteIntensity).toBe(0.6)
    expect(effect.vignetteSmoothness).toBe(0.5)
    expect(effect.grainIntensity).toBe(0.05)
    expect(effect.colorLevels).toBe(8)
    expect(effect.paperIntensity).toBe(0.15)
})


test('init registers shader and creates paper texture', () => {
    const gl = createMockGL()
    const registry = createMockShaderRegistry()
    const effect = new CinematicEffect()

    effect.init(registry, gl)

    expect(gl.calls.filter(c => c === 'createTexture').length).toBe(1)
})


test('render draws fullscreen quad', () => {
    const gl = createMockGL()
    const registry = createMockShaderRegistry()
    const effect = new CinematicEffect()
    effect.init(registry, gl)

    let drawn = false
    const ctx = createMockCtx()
    ctx.fullscreenQuad.draw = () => {
        drawn = true
    }

    gl.calls.length = 0
    effect.render(gl, ctx, 'sceneTexture', 1.5)

    expect(drawn).toBe(true)
    expect(gl.calls.includes('useProgram')).toBe(true)
})


test('dispose cleans up paper texture', () => {
    const gl = createMockGL()
    const registry = createMockShaderRegistry()
    const effect = new CinematicEffect()
    effect.init(registry, gl)

    gl.calls.length = 0
    effect.dispose(gl)

    const deleteCalls = gl.calls.filter(c => c.fn === 'deleteTexture')
    expect(deleteCalls.length).toBe(1)
    expect(deleteCalls[0].args[0]).toBe('paperTex')
})
