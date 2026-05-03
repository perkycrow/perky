import VolumetricFogEffect from './volumetric_fog_effect.js'


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
        RGBA16F: 0x881A,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
        HALF_FLOAT: 0x140B,
        LINEAR: 0x2601,
        CLAMP_TO_EDGE: 0x812F,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        calls,
        createTexture () {
            return 'fogTex'
        },
        createFramebuffer () {
            return 'fogFBO'
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
        uniform2fv () {},
        uniform3f () {},
        uniform3fv () {},
        uniformMatrix4fv () {}
    }
}


function createMockShaderRegistry () {
    const mockProgram = {
        program: 'fogProgram',
        uniforms: {
            uDepth: 0,
            uLightData: 1,
            uInverseViewProjection: 2,
            uCameraPosition: 3,
            uNumLights: 4,
            uTime: 5,
            uFogDensity: 6,
            uFogHeightFalloff: 7,
            uFogBaseHeight: 8,
            uFogNoiseScale: 9,
            uFogNoiseStrength: 10,
            uFogWindDirection: 11,
            uFogWindSpeed: 12,
            uFogScatterAnisotropy: 13,
            uFogColor: 14,
            uFogSteps: 15,
            uFogMaxDistance: 16,
            uFogStartDistance: 17,
            uFogTexture: 18,
            uSceneColor: 19,
            uTexelSize: 20
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
        gBuffer: {depthTexture: 'depthTex'},
        camera3d: {position: {x: 0, y: 0, z: 0}},
        inverseVP: {elements: new Float32Array(16)},
        lightDataTexture: {texture: 'lightDataTex'},
        numLights: 2,
        fogColor: [0.1, 0.1, 0.1],
        fullscreenQuad: {draw () {}}
    }
}


test('default state', () => {
    const effect = new VolumetricFogEffect()
    expect(effect.enabled).toBe(false)
    expect(effect.density).toBe(0.05)
    expect(effect.steps).toBe(16)
    expect(effect.maxDistance).toBe(80)
    expect(effect.startDistance).toBe(3)
})


test('getters and setters', () => {
    const effect = new VolumetricFogEffect()
    effect.enabled = true
    effect.density = 0.1
    effect.heightFalloff = 0.3
    effect.baseHeight = 1.0
    effect.noiseScale = 0.2
    effect.noiseStrength = 0.8
    effect.windDirection = [0.5, 0.5]
    effect.windSpeed = 1.0
    effect.scatterAnisotropy = 0.5
    effect.steps = 32
    effect.maxDistance = 60
    effect.startDistance = 5
    effect.time = 10

    expect(effect.enabled).toBe(true)
    expect(effect.density).toBe(0.1)
    expect(effect.heightFalloff).toBe(0.3)
    expect(effect.baseHeight).toBe(1.0)
    expect(effect.noiseScale).toBe(0.2)
    expect(effect.noiseStrength).toBe(0.8)
    expect(effect.windDirection).toEqual([0.5, 0.5])
    expect(effect.windSpeed).toBe(1.0)
    expect(effect.scatterAnisotropy).toBe(0.5)
    expect(effect.steps).toBe(32)
    expect(effect.maxDistance).toBe(60)
    expect(effect.startDistance).toBe(5)
    expect(effect.time).toBe(10)
})


test('render returns blur texture', () => {
    const gl = createMockGL()
    const effect = new VolumetricFogEffect()
    effect.init(createMockShaderRegistry())

    const result = effect.render(gl, createMockCtx(), 'sceneTex')
    expect(result).toBe('fogTex')
})


test('dispose cleans up', () => {
    const gl = createMockGL()
    const effect = new VolumetricFogEffect()
    effect.init(createMockShaderRegistry())
    effect.render(gl, createMockCtx(), 'sceneTex')

    effect.dispose(gl)

    const delFBO = gl.calls.filter(c => c.fn === 'deleteFramebuffer')
    const delTex = gl.calls.filter(c => c.fn === 'deleteTexture')
    expect(delFBO.length).toBe(2)
    expect(delTex.length).toBe(2)
})
