import WebGLMeshRenderer from './webgl_mesh_renderer.js'
import WebGLObjectRenderer from './webgl_object_renderer.js'
import MeshInstance from '../mesh_instance.js'
import Material3D from '../material_3d.js'
import Light3D from '../light_3d.js'
import Camera3D from '../camera_3d.js'
import Matrix4 from '../../math/matrix4.js'


function createMockGL () {
    const calls = []
    return {
        DEPTH_TEST: 0x0B71,
        LEQUAL: 0x0203,
        DEPTH_BUFFER_BIT: 0x00000100,
        TEXTURE0: 0x84C0,
        TEXTURE1: 0x84C1,
        TEXTURE2: 0x84C2,
        TEXTURE3: 0x84C3,
        TEXTURE_2D: 0x0DE1,
        FRAMEBUFFER: 0x8D40,
        CULL_FACE: 0x0B44,
        FRONT: 0x0404,
        RGBA32F: 0x8814,
        RGBA: 0x1908,
        FLOAT: 0x1406,
        NEAREST: 0x2600,
        CLAMP_TO_EDGE: 0x812F,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        BLEND: 0x0BE2,
        SRC_ALPHA: 0x0302,
        ONE_MINUS_SRC_ALPHA: 0x0303,
        TEXTURE4: 0x84C4,
        TEXTURE_CUBE_MAP: 0x8513,
        DEPTH_COMPONENT24: 0x81A6,
        DEPTH_COMPONENT: 0x1902,
        UNSIGNED_INT: 0x1405,
        TEXTURE_COMPARE_MODE: 0x884C,
        COMPARE_REF_TO_TEXTURE: 0x884E,
        TEXTURE_COMPARE_FUNC: 0x884D,
        LINEAR: 0x2601,
        R32F: 0x822E,
        RED: 0x1903,
        COLOR_BUFFER_BIT: 0x4000,
        canvas: {width: 800, height: 600},
        calls,
        createTexture () {
            calls.push({fn: 'createTexture'})
            return 'lightDataTex'
        },
        deleteTexture (tex) {
            calls.push({fn: 'deleteTexture', args: [tex]})
        },
        enable (cap) {
            calls.push({fn: 'enable', args: [cap]})
        },
        disable (cap) {
            calls.push({fn: 'disable', args: [cap]})
        },
        depthFunc (func) {
            calls.push({fn: 'depthFunc', args: [func]})
        },
        clear (mask) {
            calls.push({fn: 'clear', args: [mask]})
        },
        useProgram (p) {
            calls.push({fn: 'useProgram', args: [p]})
        },
        uniformMatrix4fv (loc, transpose, data) {
            calls.push({fn: 'uniformMatrix4fv', args: [loc, transpose, data]})
        },
        uniform3fv (loc, data) {
            calls.push({fn: 'uniform3fv', args: [loc, data]})
        },
        uniform2f (...args) {
            calls.push({fn: 'uniform2f', args})
        },
        uniform3f (...args) {
            calls.push({fn: 'uniform3f', args})
        },
        uniform4f (...args) {
            calls.push({fn: 'uniform4f', args})
        },
        uniform1f (loc, val) {
            calls.push({fn: 'uniform1f', args: [loc, val]})
        },
        uniform1fv (loc, data) {
            calls.push({fn: 'uniform1fv', args: [loc, data]})
        },
        uniform1i (loc, val) {
            calls.push({fn: 'uniform1i', args: [loc, val]})
        },
        activeTexture (unit) {
            calls.push({fn: 'activeTexture', args: [unit]})
        },
        bindTexture (target, tex) {
            calls.push({fn: 'bindTexture', args: [target, tex]})
        },
        bindFramebuffer (target, fb) {
            calls.push({fn: 'bindFramebuffer', args: [target, fb]})
        },
        viewport (...args) {
            calls.push({fn: 'viewport', args})
        },
        cullFace (mode) {
            calls.push({fn: 'cullFace', args: [mode]})
        },
        texImage2D (...args) {
            calls.push({fn: 'texImage2D', args})
        },
        texSubImage2D (...args) {
            calls.push({fn: 'texSubImage2D', args})
        },
        texParameteri (...args) {
            calls.push({fn: 'texParameteri', args})
        },
        blendFunc (...args) {
            calls.push({fn: 'blendFunc', args})
        },
        depthMask (flag) {
            calls.push({fn: 'depthMask', args: [flag]})
        }
    }
}


function createMockShaderRegistry () {
    const mockProgram = {
        program: 'mockProgram',
        uniforms: {
            uProjection: 0,
            uView: 1,
            uModel: 2,
            uTexture: 3,
            uLightDirection: 4,
            uAmbientSky: 5,
            uAmbientGround: 33,
            uTintColor: 6,
            uFogNear: 7,
            uFogFar: 8,
            uFogColor: 9,
            uMaterialColor: 10,
            uMaterialEmissive: 11,
            uMaterialOpacity: 12,
            uUnlit: 13,
            uHasTexture: 14,
            uNumLights: 15,
            uLightData: 16,
            uUVScale: 17,
            uRoughness: 18,
            uSpecular: 19,
            uCameraPosition: 20,
            uNormalMap: 21,
            uHasNormalMap: 22,
            uNormalStrength: 23,
            uLightMatrix: 24,
            uShadowMap: 25,
            uHasShadowMap: 26,
            uCubeShadow0: 28,
            uCubeShadow1: 29,
            uCubeShadowPos0: 30,
            uCubeShadowPos1: 31,
            uCubeShadowFar0: 32,
            uCubeShadowFar1: 34,
            uNumCubeShadows: 35,
            uHasVertexColors: 27
        },
        attributes: {
            aPosition: 0,
            aNormal: 1,
            aTexCoord: 2,
            aTangent: 3
        },
        registerUniform () {
            return this
        },
        registerAttribute () {
            return this
        }
    }

    return {
        register () {
            return mockProgram
        },
        mockProgram
    }
}


function createMockTextureManager () {
    return {
        acquire () {
            return 'glTexture'
        },
        release () {
            return true
        }
    }
}


function createRenderer () {
    const gl = createMockGL()
    const shaderRegistry = createMockShaderRegistry()
    const textureManager = createMockTextureManager()
    const renderer = new WebGLMeshRenderer()
    renderer.init({gl, shaderRegistry, textureManager})
    return {renderer, gl, shaderRegistry}
}


describe('WebGLMeshRenderer', () => {

    test('extends WebGLObjectRenderer', () => {
        const renderer = new WebGLMeshRenderer()
        expect(renderer).toBeInstanceOf(WebGLObjectRenderer)
    })


    test('handles MeshInstance', () => {
        expect(WebGLMeshRenderer.handles).toEqual([MeshInstance])
    })


    test('init registers mesh shader', () => {
        createRenderer()
    })


    test('camera3d getter/setter', () => {
        const renderer = new WebGLMeshRenderer()
        expect(renderer.camera3d).toBe(null)
        const fakeCam = {}
        renderer.camera3d = fakeCam
        expect(renderer.camera3d).toBe(fakeCam)
    })


    test('lightDirection getter/setter', () => {
        const renderer = new WebGLMeshRenderer()
        renderer.lightDirection = [1, 0, 0]
        expect(renderer.lightDirection).toEqual([1, 0, 0])
    })


    test('ambient setter accepts number for backward compatibility', () => {
        const renderer = new WebGLMeshRenderer()
        renderer.ambient = 0.5
        expect(renderer.ambientSky).toEqual([0.5, 0.5, 0.5])
        expect(renderer.ambientGround).toEqual([0.5, 0.5, 0.5])
    })


    test('ambientSky and ambientGround getters/setters', () => {
        const renderer = new WebGLMeshRenderer()
        renderer.ambientSky = [0.4, 0.45, 0.5]
        renderer.ambientGround = [0.1, 0.08, 0.05]
        expect(renderer.ambientSky).toEqual([0.4, 0.45, 0.5])
        expect(renderer.ambientGround).toEqual([0.1, 0.08, 0.05])
    })


    test('fog getters/setters', () => {
        const renderer = new WebGLMeshRenderer()
        renderer.fogNear = 10
        renderer.fogFar = 50
        renderer.fogColor = [0.1, 0.2, 0.3]
        expect(renderer.fogNear).toBe(10)
        expect(renderer.fogFar).toBe(50)
        expect(renderer.fogColor).toEqual([0.1, 0.2, 0.3])
    })


    test('lights getter/setter', () => {
        const renderer = new WebGLMeshRenderer()
        expect(renderer.lights).toEqual([])
        const lights = [new Light3D({x: 1})]
        renderer.lights = lights
        expect(renderer.lights).toBe(lights)
    })


    test('shadowMap getter/setter', () => {
        const renderer = new WebGLMeshRenderer()
        expect(renderer.shadowMap).toBe(null)
        const fakeShadow = {}
        renderer.shadowMap = fakeShadow
        expect(renderer.shadowMap).toBe(fakeShadow)
    })

})


describe('flush', () => {

    test('with no collected items does nothing', () => {
        const {renderer, gl} = createRenderer()
        renderer.flush()
        expect(gl.calls.filter(c => c.fn === 'enable').length).toBe(0)
    })


    test('with no camera does nothing', () => {
        const {renderer, gl} = createRenderer()

        const mi = new MeshInstance({mesh: {draw () {}}, texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        renderer.flush()
        expect(gl.calls.filter(c => c.fn === 'enable').length).toBe(0)
    })


    test('enables and disables depth test', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const mi = new MeshInstance({mesh: {draw () {}}, texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        gl.calls.length = 0
        renderer.flush()

        const enableCalls = gl.calls.filter(c => c.fn === 'enable')
        expect(enableCalls.length).toBe(1)
        expect(enableCalls[0].args[0]).toBe(gl.DEPTH_TEST)

        const disableCalls = gl.calls.filter(c => c.fn === 'disable')
        expect(disableCalls.length).toBe(1)
        expect(disableCalls[0].args[0]).toBe(gl.DEPTH_TEST)
    })


    test('draws collected mesh instances', () => {
        const {renderer} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        let drawCalled = false
        const fakeMesh = {draw () {
            drawCalled = true
        }}
        const mi = new MeshInstance({mesh: fakeMesh, texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        renderer.flush()
        expect(drawCalled).toBe(true)
    })


    test('uploads material uniforms when material is set', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const mat = new Material3D({color: [0.5, 0.3, 0.1], emissive: [1, 0, 0], opacity: 0.8, unlit: true})
        const mi = new MeshInstance({mesh: {draw () {}}, texture: null, material: mat})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1, mi.renderHints)

        gl.calls.length = 0
        renderer.flush()

        const colorCalls = gl.calls.filter(c => c.fn === 'uniform3fv' && c.args[0] === 10)
        expect(colorCalls.length).toBeGreaterThanOrEqual(1)
        expect(colorCalls[0].args[1]).toEqual([0.5, 0.3, 0.1])
    })


    test('uploads light count and binds light data texture', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})
        renderer.lights = [
            new Light3D({x: 1, y: 2, z: 3, color: [1, 0.9, 0.7], intensity: 1.5, radius: 8})
        ]

        const mi = new MeshInstance({mesh: {draw () {}}, texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        gl.calls.length = 0
        renderer.flush()

        const numLightCalls = gl.calls.filter(c => c.fn === 'uniform1i' && c.args[0] === 15)
        expect(numLightCalls.length).toBe(1)
        expect(numLightCalls[0].args[1]).toBe(1)

        const activeCalls = gl.calls.filter(c => c.fn === 'activeTexture' && c.args[0] === gl.TEXTURE3)
        expect(activeCalls.length).toBe(1)

        const lightDataCalls = gl.calls.filter(c => c.fn === 'uniform1i' && c.args[0] === 16)
        expect(lightDataCalls.length).toBe(1)
        expect(lightDataCalls[0].args[1]).toBe(3)
    })


    test('uploads light data via texture', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({x: 0, y: 0, z: 0})
        renderer.fogFar = 200
        renderer.lights = [
            new Light3D({x: 0, y: 0, z: -100}),
            new Light3D({x: 0, y: 0, z: -1}),
            new Light3D({x: 0, y: 0, z: -50})
        ]

        const mi = new MeshInstance({mesh: {draw () {}}, texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        gl.calls.length = 0
        renderer.flush()

        const subCalls = gl.calls.filter(c => c.fn === 'texSubImage2D')
        expect(subCalls.length).toBe(1)
        const data = subCalls[0].args[8]
        expect(data[2]).toBe(-1)
        expect(data[18]).toBe(-50)
        expect(data[34]).toBe(-100)
    })


    test('uploads camera position uniform', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({x: 2, y: 3, z: 5})

        const mi = new MeshInstance({mesh: {draw () {}}, texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        gl.calls.length = 0
        renderer.flush()

        const camCalls = gl.calls.filter(c => c.fn === 'uniform3f' && c.args[0] === 20)
        expect(camCalls.length).toBeGreaterThanOrEqual(1)
        expect(camCalls[0].args[1]).toBe(2)
        expect(camCalls[0].args[2]).toBe(3)
        expect(camCalls[0].args[3]).toBe(5)
    })


    test('uploads uvScale from material', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const mat = new Material3D({uvScale: [4, 2]})
        const mi = new MeshInstance({mesh: {draw () {}}, texture: null, material: mat})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1, mi.renderHints)

        gl.calls.length = 0
        renderer.flush()

        const scaleCalls = gl.calls.filter(c => c.fn === 'uniform2f' && c.args[0] === 17)
        expect(scaleCalls.length).toBeGreaterThanOrEqual(2)
        const applyCalls = scaleCalls.filter(c => c.args[1] === 4 && c.args[2] === 2)
        expect(applyCalls.length).toBe(1)
    })


    test('uploads roughness and specular from material', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const mat = new Material3D({roughness: 0.8, specular: 0.3})
        const mi = new MeshInstance({mesh: {draw () {}}, texture: null, material: mat})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1, mi.renderHints)

        gl.calls.length = 0
        renderer.flush()

        const roughCalls = gl.calls.filter(c => c.fn === 'uniform1f' && c.args[0] === 18 && c.args[1] === 0.8)
        expect(roughCalls.length).toBe(1)

        const specCalls = gl.calls.filter(c => c.fn === 'uniform1f' && c.args[0] === 19 && c.args[1] === 0.3)
        expect(specCalls.length).toBe(1)
    })


    test('binds normal map on TEXTURE1 when material has normalMap', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const normalTex = {id: 'normalTex'}
        const mat = new Material3D({normalMap: normalTex, normalStrength: 0.6})
        const mi = new MeshInstance({mesh: {draw () {}}, texture: null, material: mat})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1, mi.renderHints)

        gl.calls.length = 0
        renderer.flush()

        const activeCalls = gl.calls.filter(c => c.fn === 'activeTexture' && c.args[0] === gl.TEXTURE1)
        expect(activeCalls.length).toBeGreaterThanOrEqual(1)

        const hasNormalCalls = gl.calls.filter(c => c.fn === 'uniform1f' && c.args[0] === 22 && c.args[1] === 1)
        expect(hasNormalCalls.length).toBe(1)

        const strengthCalls = gl.calls.filter(c => c.fn === 'uniform1f' && c.args[0] === 23 && c.args[1] === 0.6)
        expect(strengthCalls.length).toBe(1)
    })


    test('uses activeTexture from mesh instance', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const matTex = {id: 'matTex'}
        const mat = new Material3D({texture: matTex})
        const mi = new MeshInstance({mesh: {draw () {}}, material: mat})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        gl.calls.length = 0
        renderer.flush()

        const diffuseBind = gl.calls.filter(
            c => c.fn === 'bindTexture' && c.args[1] === 'glTexture'
        )
        expect(diffuseBind.length).toBe(1)
    })


    test('renders shadow pass when shadowMap is set', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        let drawCount = 0
        const mi = new MeshInstance({mesh: {draw () {
            drawCount++
        }},
        texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        const fakeShadowMap = {
            texture: 'shadowTex',
            lightMatrix: new Matrix4(),
            lightProjection: new Matrix4(),
            lightView: new Matrix4(),
            update () {},
            begin () {},
            end () {}
        }
        renderer.shadowMap = fakeShadowMap

        gl.calls.length = 0
        renderer.flush()

        expect(drawCount).toBe(2)

        const cullEnables = gl.calls.filter(c => c.fn === 'enable' && c.args[0] === gl.CULL_FACE)
        expect(cullEnables.length).toBe(1)

        const cullDisables = gl.calls.filter(c => c.fn === 'disable' && c.args[0] === gl.CULL_FACE)
        expect(cullDisables.length).toBe(1)

        const viewportCalls = gl.calls.filter(c => c.fn === 'viewport')
        expect(viewportCalls.length).toBeGreaterThanOrEqual(1)
        const lastViewport = viewportCalls[viewportCalls.length - 1]
        expect(lastViewport.args).toEqual([0, 0, 800, 600])
    })


    test('skips objects with castShadow false in shadow pass', () => {
        const {renderer} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        let drawCount = 0
        const fakeMesh = {draw () {
            drawCount++
        }}

        const caster = new MeshInstance({mesh: fakeMesh, texture: null})
        caster.updateWorldMatrix()
        renderer.collect(caster, 1)

        const noCaster = new MeshInstance({mesh: fakeMesh, texture: null, castShadow: false})
        noCaster.updateWorldMatrix()
        renderer.collect(noCaster, 1)

        renderer.shadowMap = {
            texture: 'shadowTex',
            lightMatrix: new Matrix4(),
            lightProjection: new Matrix4(),
            lightView: new Matrix4(),
            update () {},
            begin () {},
            end () {}
        }

        renderer.flush()

        expect(drawCount).toBe(3)
    })


    test('binds shadow map on TEXTURE2 when shadowMap is set', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const mi = new MeshInstance({mesh: {draw () {}}, texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        renderer.shadowMap = {
            texture: 'shadowTex',
            lightMatrix: new Matrix4(),
            lightProjection: new Matrix4(),
            lightView: new Matrix4(),
            update () {},
            begin () {},
            end () {}
        }

        gl.calls.length = 0
        renderer.flush()

        const activeCalls = gl.calls.filter(c => c.fn === 'activeTexture' && c.args[0] === gl.TEXTURE2)
        expect(activeCalls.length).toBe(1)

        const hasShadowCalls = gl.calls.filter(c => c.fn === 'uniform1f' && c.args[0] === 26 && c.args[1] === 1)
        expect(hasShadowCalls.length).toBe(1)
    })


    test('sets uHasShadowMap to 0 when no shadowMap', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const mi = new MeshInstance({mesh: {draw () {}}, texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        gl.calls.length = 0
        renderer.flush()

        const hasShadowCalls = gl.calls.filter(c => c.fn === 'uniform1f' && c.args[0] === 26 && c.args[1] === 0)
        expect(hasShadowCalls.length).toBe(1)
    })


    test('skips invisible objects', () => {
        const {renderer} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        let drawCount = 0
        const fakeMesh = {draw () {
            drawCount++
        }}

        const visible = new MeshInstance({mesh: fakeMesh, texture: null})
        visible.updateWorldMatrix()
        renderer.collect(visible, 1)

        const invisible = new MeshInstance({mesh: fakeMesh, texture: null, visible: false})
        invisible.updateWorldMatrix()
        renderer.collect(invisible, 1)

        renderer.flush()
        expect(drawCount).toBe(1)
    })


    test('skips objects with null mesh', () => {
        const {renderer} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        let drawCount = 0
        const fakeMesh = {draw () {
            drawCount++
        }}

        const withMesh = new MeshInstance({mesh: fakeMesh, texture: null})
        withMesh.updateWorldMatrix()
        renderer.collect(withMesh, 1)

        const noMesh = new MeshInstance({mesh: null, texture: null})
        noMesh.updateWorldMatrix()
        renderer.collect(noMesh, 1)

        renderer.flush()
        expect(drawCount).toBe(1)
    })


    test('applies tint hints', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const mi = new MeshInstance({mesh: {draw () {}}, texture: null, tint: {r: 0.5, g: 0.3, b: 0.1, a: 0.8}})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1, mi.renderHints)

        gl.calls.length = 0
        renderer.flush()

        const tintCalls = gl.calls.filter(c => c.fn === 'uniform4f' && c.args[0] === 6)
        expect(tintCalls.length).toBeGreaterThanOrEqual(2)

        const appliedTint = tintCalls.find(c => c.args[1] === 0.5 && c.args[2] === 0.3 && c.args[3] === 0.1 && c.args[4] === 0.8)
        expect(appliedTint).toBeDefined()

        const resetTint = tintCalls.find(c => c.args[1] === 0 && c.args[2] === 0 && c.args[3] === 0 && c.args[4] === 0)
        expect(resetTint).toBeDefined()
    })


    test('sets hasVertexColors uniform based on mesh', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const meshWithColors = {draw () {}, hasColors: true}
        const mi = new MeshInstance({mesh: meshWithColors, texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        gl.calls.length = 0
        renderer.flush()

        const hasColorsCalls = gl.calls.filter(c => c.fn === 'uniform1f' && c.args[0] === 27 && c.args[1] === 1)
        expect(hasColorsCalls.length).toBe(1)
    })


    test('sets hasVertexColors to 0 when mesh has no colors', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const meshNoColors = {draw () {}, hasColors: false}
        const mi = new MeshInstance({mesh: meshNoColors, texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        gl.calls.length = 0
        renderer.flush()

        const hasColorsCalls = gl.calls.filter(c => c.fn === 'uniform1f' && c.args[0] === 27 && c.args[1] === 0)
        expect(hasColorsCalls.length).toBe(1)
    })

})


test('dispose cleans up', () => {
    const {renderer, gl} = createRenderer()
    renderer.camera3d = {}
    renderer.lights = [new Light3D()]
    gl.calls.length = 0
    renderer.dispose()
    expect(renderer.camera3d).toBe(null)
    expect(renderer.lights).toEqual([])
    const deleteCalls = gl.calls.filter(c => c.fn === 'deleteTexture')
    expect(deleteCalls.length).toBe(1)
})
