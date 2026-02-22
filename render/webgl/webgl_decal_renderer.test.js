import WebGLDecalRenderer from './webgl_decal_renderer.js'
import WebGLObjectRenderer from './webgl_object_renderer.js'
import Decal from '../decal.js'
import Material3D from '../material_3d.js'
import Camera3D from '../camera_3d.js'


function createMockGL () {
    const calls = []
    return {
        DEPTH_TEST: 0x0B71,
        LEQUAL: 0x0203,
        TEXTURE_2D: 0x0DE1,
        TEXTURE0: 0x84C0,
        POLYGON_OFFSET_FILL: 0x8037,
        BLEND: 0x0BE2,
        SRC_ALPHA: 0x0302,
        ONE_MINUS_SRC_ALPHA: 0x0303,
        FLOAT: 0x1406,
        ARRAY_BUFFER: 0x8892,
        ELEMENT_ARRAY_BUFFER: 0x8893,
        STATIC_DRAW: 0x88E4,
        UNSIGNED_SHORT: 0x1403,
        TRIANGLES: 0x0004,
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
        depthMask (flag) {
            calls.push({fn: 'depthMask', args: [flag]})
        },
        polygonOffset (factor, units) {
            calls.push({fn: 'polygonOffset', args: [factor, units]})
        },
        blendFunc (src, dst) {
            calls.push({fn: 'blendFunc', args: [src, dst]})
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
        },
        createBuffer: () => ({}),
        bindBuffer: () => {},
        bufferData: () => {},
        enableVertexAttribArray: () => {},
        vertexAttribPointer: () => {},
        createVertexArray: () => ({}),
        bindVertexArray: () => {},
        deleteBuffer: () => {},
        deleteVertexArray: () => {},
        drawElements () {
            calls.push({fn: 'drawElements'})
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
            uHasTexture: 4,
            uColor: 5,
            uEmissive: 6,
            uOpacity: 7,
            uFogNear: 8,
            uFogFar: 9,
            uFogColor: 10
        },
        attributes: {
            aPosition: 0,
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
    const renderer = new WebGLDecalRenderer()
    renderer.init({gl, shaderRegistry, textureManager})
    return {renderer, gl, shaderRegistry}
}


describe('WebGLDecalRenderer', () => {

    test('extends WebGLObjectRenderer', () => {
        const renderer = new WebGLDecalRenderer()
        expect(renderer).toBeInstanceOf(WebGLObjectRenderer)
    })


    test('handles Decal', () => {
        expect(WebGLDecalRenderer.handles).toEqual([Decal])
    })


    test('camera3d getter/setter', () => {
        const renderer = new WebGLDecalRenderer()
        expect(renderer.camera3d).toBe(null)
        const cam = {}
        renderer.camera3d = cam
        expect(renderer.camera3d).toBe(cam)
    })


    test('fog getters/setters', () => {
        const renderer = new WebGLDecalRenderer()
        renderer.fogNear = 10
        renderer.fogFar = 50
        renderer.fogColor = [0.1, 0.2, 0.3]
        expect(renderer.fogNear).toBe(10)
        expect(renderer.fogFar).toBe(50)
        expect(renderer.fogColor).toEqual([0.1, 0.2, 0.3])
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

        const decal = new Decal({x: 0, y: 1, z: -3})
        renderer.collect(decal, 1)

        renderer.flush()
        expect(gl.calls.filter(c => c.fn === 'enable').length).toBe(0)
    })


    test('enables depth test, polygon offset and blend', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const decal = new Decal({x: 0, y: 1, z: -3})
        renderer.collect(decal, 1)

        gl.calls.length = 0
        renderer.flush()

        const enableCalls = gl.calls.filter(c => c.fn === 'enable')
        expect(enableCalls.length).toBe(3)
        expect(enableCalls[0].args[0]).toBe(gl.DEPTH_TEST)
        expect(enableCalls[1].args[0]).toBe(gl.POLYGON_OFFSET_FILL)
        expect(enableCalls[2].args[0]).toBe(gl.BLEND)

        const offsetCalls = gl.calls.filter(c => c.fn === 'polygonOffset')
        expect(offsetCalls.length).toBe(1)
        expect(offsetCalls[0].args).toEqual([-1, -1])

        const blendCalls = gl.calls.filter(c => c.fn === 'blendFunc')
        expect(blendCalls.length).toBe(1)
        expect(blendCalls[0].args).toEqual([gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA])

        const depthMaskCalls = gl.calls.filter(c => c.fn === 'depthMask')
        expect(depthMaskCalls[0].args[0]).toBe(false)
        expect(depthMaskCalls[1].args[0]).toBe(true)

        const disableCalls = gl.calls.filter(c => c.fn === 'disable')
        expect(disableCalls.length).toBe(3)
    })


    test('sorts decals back-to-front', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 0})

        const drawOrder = []
        gl.drawElements = () => {
            const modelCalls = gl.calls.filter(c => c.fn === 'uniformMatrix4fv' && c.args[0] === 2)
            if (modelCalls.length > 0) {
                const last = modelCalls[modelCalls.length - 1].args[2]
                drawOrder.push(last[14])
            }
        }

        const near = new Decal({x: 0, y: 0, z: -2})
        const far = new Decal({x: 0, y: 0, z: -10})
        const mid = new Decal({x: 0, y: 0, z: -5})
        near.updateWorldMatrix()
        far.updateWorldMatrix()
        mid.updateWorldMatrix()

        renderer.collect(near, 1)
        renderer.collect(far, 1)
        renderer.collect(mid, 1)

        renderer.flush()

        expect(drawOrder).toEqual([-10, -5, -2])
    })


    test('uploads model matrix with width and height', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const decal = new Decal({x: 1, y: 2, z: 3, width: 0.5, height: 0.3})
        decal.updateWorldMatrix()
        renderer.collect(decal, 1)

        gl.calls.length = 0
        renderer.flush()

        const modelCalls = gl.calls.filter(c => c.fn === 'uniformMatrix4fv' && c.args[0] === 2)
        expect(modelCalls.length).toBe(1)
        const m = modelCalls[0].args[2]
        expect(m[12]).toBe(1)
        expect(m[13]).toBe(2)
        expect(m[14]).toBe(3)
        expect(Math.abs(m[0] - 0.5)).toBeLessThan(1e-6)
        expect(Math.abs(m[5] - 0.3)).toBeLessThan(1e-6)
    })


    test('uploads material uniforms', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const mat = new Material3D({color: [0.5, 0.3, 0.1], emissive: [0.1, 0.1, 0], opacity: 0.4})
        const decal = new Decal({material: mat})
        renderer.collect(decal, 1)

        gl.calls.length = 0
        renderer.flush()

        const colorCalls = gl.calls.filter(c => c.fn === 'uniform3fv' && c.args[0] === 5)
        expect(colorCalls.length).toBeGreaterThanOrEqual(1)
        expect(colorCalls[0].args[1]).toEqual([0.5, 0.3, 0.1])

        const opacityCalls = gl.calls.filter(c => c.fn === 'uniform1f' && c.args[0] === 7 && c.args[1] === 0.4)
        expect(opacityCalls.length).toBe(1)
    })


    test('binds texture when material has one', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const tex = {id: 'decalTex'}
        const mat = new Material3D({texture: tex})
        const decal = new Decal({material: mat})
        renderer.collect(decal, 1)

        gl.calls.length = 0
        renderer.flush()

        const bindCalls = gl.calls.filter(c => c.fn === 'bindTexture')
        expect(bindCalls.length).toBe(1)
    })

})


test('dispose cleans up', () => {
    const {renderer} = createRenderer()
    renderer.camera3d = {}
    renderer.dispose()
    expect(renderer.camera3d).toBe(null)
})
