import WebGLMeshRenderer from './webgl_mesh_renderer.js'
import WebGLObjectRenderer from './webgl_object_renderer.js'
import MeshInstance from '../mesh_instance.js'
import Material3D from '../material_3d.js'
import Light3D from '../light_3d.js'
import Camera3D from '../camera_3d.js'


function createMockGL () {
    const calls = []
    return {
        DEPTH_TEST: 0x0B71,
        LEQUAL: 0x0203,
        DEPTH_BUFFER_BIT: 0x00000100,
        TEXTURE0: 0x84C0,
        TEXTURE_2D: 0x0DE1,
        calls,
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
            uAmbient: 5,
            uTintColor: 6,
            uFogNear: 7,
            uFogFar: 8,
            uFogColor: 9,
            uMaterialColor: 10,
            uMaterialEmissive: 11,
            uMaterialOpacity: 12,
            uUnlit: 13,
            uNumLights: 14,
            uLightPositions: 15,
            uLightColors: 16,
            uLightIntensities: 17,
            uLightRadii: 18
        },
        attributes: {
            aPosition: 0,
            aNormal: 1,
            aTexCoord: 2
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


    test('ambient getter/setter', () => {
        const renderer = new WebGLMeshRenderer()
        renderer.ambient = 0.5
        expect(renderer.ambient).toBe(0.5)
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


    test('uploads light uniforms when lights are set', () => {
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

        const numLightCalls = gl.calls.filter(c => c.fn === 'uniform1i' && c.args[0] === 14)
        expect(numLightCalls.length).toBe(1)
        expect(numLightCalls[0].args[1]).toBe(1)

        const posCalls = gl.calls.filter(c => c.fn === 'uniform3fv' && c.args[0] === 15)
        expect(posCalls.length).toBe(1)
        expect(posCalls[0].args[1][0]).toBe(1)
        expect(posCalls[0].args[1][1]).toBe(2)
        expect(posCalls[0].args[1][2]).toBe(3)
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

        const bindCalls = gl.calls.filter(c => c.fn === 'bindTexture')
        expect(bindCalls.length).toBe(1)
    })

})


test('dispose cleans up', () => {
    const {renderer} = createRenderer()
    renderer.camera3d = {}
    renderer.lights = [new Light3D()]
    renderer.dispose()
    expect(renderer.camera3d).toBe(null)
    expect(renderer.lights).toEqual([])
})
