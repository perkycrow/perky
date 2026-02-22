import WebGLSkyboxRenderer from './webgl_skybox_renderer.js'
import WebGLObjectRenderer from './webgl_object_renderer.js'
import Skybox from '../skybox.js'
import Camera3D from '../camera_3d.js'


function createMockGL () {
    const calls = []
    return {
        DEPTH_TEST: 0x0B71,
        LEQUAL: 0x0203,
        CULL_FACE: 0x0B44,
        FRONT: 0x0404,
        TRIANGLES: 0x0004,
        UNSIGNED_SHORT: 0x1403,
        ARRAY_BUFFER: 0x8892,
        ELEMENT_ARRAY_BUFFER: 0x8893,
        STATIC_DRAW: 0x88E4,
        FLOAT: 0x1406,
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
        cullFace (mode) {
            calls.push({fn: 'cullFace', args: [mode]})
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
        uniform1f (loc, val) {
            calls.push({fn: 'uniform1f', args: [loc, val]})
        },
        createBuffer () {
            return {}
        },
        bindBuffer () {},
        bufferData () {},
        enableVertexAttribArray () {},
        vertexAttribPointer () {},
        createVertexArray () {
            return {}
        },
        bindVertexArray () {},
        deleteBuffer () {},
        deleteVertexArray () {},
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
            uViewRotation: 1,
            uSkyColor: 2,
            uHorizonColor: 3,
            uGroundColor: 4,
            uHasCubemap: 5,
            uCubemap: 6
        },
        attributes: {
            aPosition: 0
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


function createRenderer () {
    const gl = createMockGL()
    const shaderRegistry = createMockShaderRegistry()
    const renderer = new WebGLSkyboxRenderer()
    renderer.init({gl, shaderRegistry})
    return {renderer, gl, shaderRegistry}
}


describe('WebGLSkyboxRenderer', () => {

    test('extends WebGLObjectRenderer', () => {
        const renderer = new WebGLSkyboxRenderer()
        expect(renderer).toBeInstanceOf(WebGLObjectRenderer)
    })


    test('handles nothing', () => {
        expect(WebGLSkyboxRenderer.handles).toEqual([])
    })


    test('camera3d getter/setter', () => {
        const renderer = new WebGLSkyboxRenderer()
        expect(renderer.camera3d).toBe(null)
        const cam = {}
        renderer.camera3d = cam
        expect(renderer.camera3d).toBe(cam)
    })


    test('skybox getter/setter', () => {
        const renderer = new WebGLSkyboxRenderer()
        expect(renderer.skybox).toBe(null)
        const sky = new Skybox()
        renderer.skybox = sky
        expect(renderer.skybox).toBe(sky)
    })

})


describe('flush', () => {

    test('with no skybox does nothing', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})
        renderer.flush()
        expect(gl.calls.filter(c => c.fn === 'enable').length).toBe(0)
    })


    test('with no camera does nothing', () => {
        const {renderer, gl} = createRenderer()
        renderer.skybox = new Skybox()
        renderer.flush()
        expect(gl.calls.filter(c => c.fn === 'enable').length).toBe(0)
    })


    test('enables depth test with LEQUAL and disables depth write', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})
        renderer.skybox = new Skybox()

        gl.calls.length = 0
        renderer.flush()

        const depthFuncCalls = gl.calls.filter(c => c.fn === 'depthFunc')
        expect(depthFuncCalls[0].args[0]).toBe(gl.LEQUAL)

        const depthMaskCalls = gl.calls.filter(c => c.fn === 'depthMask')
        expect(depthMaskCalls[0].args[0]).toBe(false)
        expect(depthMaskCalls[1].args[0]).toBe(true)
    })


    test('enables front face culling', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})
        renderer.skybox = new Skybox()

        gl.calls.length = 0
        renderer.flush()

        const cullEnables = gl.calls.filter(c => c.fn === 'enable' && c.args[0] === gl.CULL_FACE)
        expect(cullEnables.length).toBe(1)

        const cullFaceCalls = gl.calls.filter(c => c.fn === 'cullFace')
        expect(cullFaceCalls[0].args[0]).toBe(gl.FRONT)

        const cullDisables = gl.calls.filter(c => c.fn === 'disable' && c.args[0] === gl.CULL_FACE)
        expect(cullDisables.length).toBe(1)
    })


    test('uploads sky color uniforms', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})
        renderer.skybox = new Skybox({
            skyColor: [0.01, 0.02, 0.06],
            horizonColor: [0.04, 0.04, 0.07],
            groundColor: [0.03, 0.03, 0.02]
        })

        gl.calls.length = 0
        renderer.flush()

        const skyCalls = gl.calls.filter(c => c.fn === 'uniform3fv' && c.args[0] === 2)
        expect(skyCalls[0].args[1]).toEqual([0.01, 0.02, 0.06])

        const horizonCalls = gl.calls.filter(c => c.fn === 'uniform3fv' && c.args[0] === 3)
        expect(horizonCalls[0].args[1]).toEqual([0.04, 0.04, 0.07])

        const groundCalls = gl.calls.filter(c => c.fn === 'uniform3fv' && c.args[0] === 4)
        expect(groundCalls[0].args[1]).toEqual([0.03, 0.03, 0.02])
    })


    test('sets uHasCubemap to 0 when no cubemap', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})
        renderer.skybox = new Skybox()

        gl.calls.length = 0
        renderer.flush()

        const cubemapCalls = gl.calls.filter(c => c.fn === 'uniform1f' && c.args[0] === 5)
        expect(cubemapCalls[0].args[1]).toBe(0)
    })


    test('uploads view rotation with zeroed translation', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({x: 10, y: 5, z: 20})
        renderer.skybox = new Skybox()

        gl.calls.length = 0
        renderer.flush()

        const viewCalls = gl.calls.filter(c => c.fn === 'uniformMatrix4fv' && c.args[0] === 1)
        expect(viewCalls.length).toBe(1)
        const viewData = viewCalls[0].args[2]
        expect(viewData[12]).toBe(0)
        expect(viewData[13]).toBe(0)
        expect(viewData[14]).toBe(0)
        expect(viewData[15]).toBe(1)
    })


    test('draws the skybox mesh', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})
        renderer.skybox = new Skybox()

        gl.calls.length = 0
        renderer.flush()

        const drawCalls = gl.calls.filter(c => c.fn === 'drawElements')
        expect(drawCalls.length).toBe(1)
    })

})


test('dispose cleans up', () => {
    const {renderer} = createRenderer()
    renderer.camera3d = {}
    renderer.skybox = new Skybox()
    renderer.dispose()
    expect(renderer.camera3d).toBe(null)
    expect(renderer.skybox).toBe(null)
})
