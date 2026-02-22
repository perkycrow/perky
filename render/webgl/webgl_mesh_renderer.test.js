import WebGLMeshRenderer from './webgl_mesh_renderer.js'
import WebGLObjectRenderer from './webgl_object_renderer.js'
import MeshInstance from '../mesh_instance.js'
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
        uniform4f (...args) {
            calls.push({fn: 'uniform4f', args})
        },
        uniform1f (loc, val) {
            calls.push({fn: 'uniform1f', args: [loc, val]})
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
            uFogColor: 9
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


describe('WebGLMeshRenderer', () => {

    test('extends WebGLObjectRenderer', () => {
        const renderer = new WebGLMeshRenderer()
        expect(renderer).toBeInstanceOf(WebGLObjectRenderer)
    })


    test('handles MeshInstance', () => {
        expect(WebGLMeshRenderer.handles).toEqual([MeshInstance])
    })


    test('init registers mesh shader', () => {
        const renderer = new WebGLMeshRenderer()
        const gl = createMockGL()
        const shaderRegistry = createMockShaderRegistry()
        const textureManager = createMockTextureManager()

        renderer.init({gl, shaderRegistry, textureManager})
    })


    test('flush with no collected items does nothing', () => {
        const renderer = new WebGLMeshRenderer()
        const gl = createMockGL()
        const shaderRegistry = createMockShaderRegistry()
        const textureManager = createMockTextureManager()

        renderer.init({gl, shaderRegistry, textureManager})
        renderer.flush()

        expect(gl.calls.filter(c => c.fn === 'enable').length).toBe(0)
    })


    test('flush with no camera does nothing', () => {
        const renderer = new WebGLMeshRenderer()
        const gl = createMockGL()
        const shaderRegistry = createMockShaderRegistry()
        const textureManager = createMockTextureManager()

        renderer.init({gl, shaderRegistry, textureManager})

        const mi = new MeshInstance({mesh: {draw () {}}, texture: null})
        mi.updateWorldMatrix()
        renderer.collect(mi, 1)

        renderer.flush()
        expect(gl.calls.filter(c => c.fn === 'enable').length).toBe(0)
    })


    test('flush enables and disables depth test', () => {
        const renderer = new WebGLMeshRenderer()
        const gl = createMockGL()
        const shaderRegistry = createMockShaderRegistry()
        const textureManager = createMockTextureManager()

        renderer.init({gl, shaderRegistry, textureManager})

        const cam = new Camera3D({z: 5})
        renderer.camera3d = cam

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


    test('flush draws collected mesh instances', () => {
        const renderer = new WebGLMeshRenderer()
        const gl = createMockGL()
        const shaderRegistry = createMockShaderRegistry()
        const textureManager = createMockTextureManager()

        renderer.init({gl, shaderRegistry, textureManager})

        const cam = new Camera3D({z: 5})
        renderer.camera3d = cam

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


    test('dispose cleans up', () => {
        const renderer = new WebGLMeshRenderer()
        const gl = createMockGL()
        const shaderRegistry = createMockShaderRegistry()
        const textureManager = createMockTextureManager()

        renderer.init({gl, shaderRegistry, textureManager})
        renderer.camera3d = {}
        renderer.dispose()
        expect(renderer.camera3d).toBe(null)
    })

})
