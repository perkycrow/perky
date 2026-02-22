import WebGLBillboardRenderer from './webgl_billboard_renderer.js'
import WebGLObjectRenderer from './webgl_object_renderer.js'
import Billboard from '../billboard.js'
import Material3D from '../material_3d.js'
import Camera3D from '../camera_3d.js'


function createMockGL () {
    const calls = []
    return {
        DEPTH_TEST: 0x0B71,
        LEQUAL: 0x0203,
        TEXTURE_2D: 0x0DE1,
        TEXTURE0: 0x84C0,
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
        uniform2f (...args) {
            calls.push({fn: 'uniform2f', args})
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
        drawElements: () => {}
    }
}


function createMockShaderRegistry () {
    const mockProgram = {
        program: 'mockProgram',
        uniforms: {
            uProjection: 0,
            uView: 1,
            uCenter: 2,
            uSize: 3,
            uTexture: 4,
            uHasTexture: 5,
            uColor: 6,
            uEmissive: 7,
            uOpacity: 8,
            uFogNear: 9,
            uFogFar: 10,
            uFogColor: 11
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
    const renderer = new WebGLBillboardRenderer()
    renderer.init({gl, shaderRegistry, textureManager})
    return {renderer, gl, shaderRegistry}
}


describe('WebGLBillboardRenderer', () => {

    test('extends WebGLObjectRenderer', () => {
        const renderer = new WebGLBillboardRenderer()
        expect(renderer).toBeInstanceOf(WebGLObjectRenderer)
    })


    test('handles Billboard', () => {
        expect(WebGLBillboardRenderer.handles).toEqual([Billboard])
    })


    test('camera3d getter/setter', () => {
        const renderer = new WebGLBillboardRenderer()
        expect(renderer.camera3d).toBe(null)
        const cam = {}
        renderer.camera3d = cam
        expect(renderer.camera3d).toBe(cam)
    })


    test('fog getters/setters', () => {
        const renderer = new WebGLBillboardRenderer()
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

        const bb = new Billboard({x: 0, y: 1, z: -3})
        renderer.collect(bb, 1)

        renderer.flush()
        expect(gl.calls.filter(c => c.fn === 'enable').length).toBe(0)
    })


    test('enables depth test and disables depth write', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const bb = new Billboard({x: 0, y: 1, z: -3})
        renderer.collect(bb, 1)

        gl.calls.length = 0
        renderer.flush()

        const enableCalls = gl.calls.filter(c => c.fn === 'enable')
        expect(enableCalls.length).toBe(1)
        expect(enableCalls[0].args[0]).toBe(gl.DEPTH_TEST)

        const depthMaskCalls = gl.calls.filter(c => c.fn === 'depthMask')
        expect(depthMaskCalls.length).toBe(2)
        expect(depthMaskCalls[0].args[0]).toBe(false)
        expect(depthMaskCalls[1].args[0]).toBe(true)

        const disableCalls = gl.calls.filter(c => c.fn === 'disable')
        expect(disableCalls.length).toBe(1)
        expect(disableCalls[0].args[0]).toBe(gl.DEPTH_TEST)
    })


    test('sorts billboards back-to-front', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 0})

        const drawOrder = []
        const originalDraw = gl.drawElements
        gl.drawElements = (...args) => {
            const lastCenter = gl.calls.filter(c => c.fn === 'uniform3f' && c.args[0] === 2)
            if (lastCenter.length > 0) {
                drawOrder.push(lastCenter[lastCenter.length - 1].args[3])
            }
            originalDraw(...args)
        }

        const near = new Billboard({x: 0, y: 0, z: -2})
        const far = new Billboard({x: 0, y: 0, z: -10})
        const mid = new Billboard({x: 0, y: 0, z: -5})

        renderer.collect(near, 1)
        renderer.collect(far, 1)
        renderer.collect(mid, 1)

        renderer.flush()

        expect(drawOrder).toEqual([-10, -5, -2])
    })


    test('uploads billboard center and size', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const bb = new Billboard({x: 1, y: 2, z: 3, width: 0.5, height: 0.3})
        renderer.collect(bb, 1)

        gl.calls.length = 0
        renderer.flush()

        const centerCalls = gl.calls.filter(c => c.fn === 'uniform3f' && c.args[0] === 2)
        expect(centerCalls.length).toBe(1)
        expect(centerCalls[0].args[1]).toBe(1)
        expect(centerCalls[0].args[2]).toBe(2)
        expect(centerCalls[0].args[3]).toBe(3)

        const sizeCalls = gl.calls.filter(c => c.fn === 'uniform2f' && c.args[0] === 3)
        expect(sizeCalls.length).toBe(1)
        expect(sizeCalls[0].args[1]).toBe(0.5)
        expect(sizeCalls[0].args[2]).toBe(0.3)
    })


    test('uploads material uniforms', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const mat = new Material3D({color: [0.5, 0.3, 0.1], emissive: [0.1, 0.1, 0], opacity: 0.4})
        const bb = new Billboard({material: mat})
        renderer.collect(bb, 1)

        gl.calls.length = 0
        renderer.flush()

        const colorCalls = gl.calls.filter(c => c.fn === 'uniform3fv' && c.args[0] === 6)
        expect(colorCalls.length).toBeGreaterThanOrEqual(1)
        expect(colorCalls[0].args[1]).toEqual([0.5, 0.3, 0.1])

        const opacityCalls = gl.calls.filter(c => c.fn === 'uniform1f' && c.args[0] === 8 && c.args[1] === 0.4)
        expect(opacityCalls.length).toBe(1)
    })


    test('binds texture when material has one', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const tex = {id: 'dustTex'}
        const mat = new Material3D({texture: tex})
        const bb = new Billboard({material: mat})
        renderer.collect(bb, 1)

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
