import WebGLSprite3DRenderer from './webgl_sprite3d_renderer.js'
import WebGLObjectRenderer from './webgl_object_renderer.js'
import Sprite3D from '../sprite_3d.js'
import Material3D from '../material_3d.js'
import Camera3D from '../camera_3d.js'


function createMockGL () {
    const calls = []
    return {
        DEPTH_TEST: 0x0B71,
        LEQUAL: 0x0203,
        TEXTURE_2D: 0x0DE1,
        TEXTURE0: 0x84C0,
        FLOAT: 0x1406,
        ARRAY_BUFFER: 0x8892,
        ELEMENT_ARRAY_BUFFER: 0x8893,
        STATIC_DRAW: 0x88E4,
        UNSIGNED_SHORT: 0x1403,
        calls,
        canvas: {width: 800, height: 600},
        enable () {
            calls.push('enable')
        },
        disable () {
            calls.push('disable')
        },
        depthFunc () {
            calls.push('depthFunc')
        },
        useProgram () {
            calls.push('useProgram')
        },
        uniformMatrix4fv () {
            calls.push('uniformMatrix4fv')
        },
        uniform1f () {
            calls.push('uniform1f')
        },
        uniform1i () {
            calls.push('uniform1i')
        },
        uniform2f () {
            calls.push('uniform2f')
        },
        uniform3f () {
            calls.push('uniform3f')
        },
        uniform3fv () {
            calls.push('uniform3fv')
        },
        activeTexture () {
            calls.push('activeTexture')
        },
        bindTexture () {
            calls.push('bindTexture')
        },
        viewport () {
            calls.push('viewport')
        },
        createBuffer () {
            return 'buf'
        },
        bindBuffer () {},
        bufferData () {},
        deleteBuffer () {},
        createVertexArray () {
            return 'vao'
        },
        bindVertexArray () {},
        deleteVertexArray () {},
        enableVertexAttribArray () {},
        vertexAttribPointer () {},
        drawElements () {
            calls.push('drawElements')
        }
    }
}


function createMockShaderRegistry () {
    return {
        register () {
            return {
                program: 'sprite3dProgram',
                uniforms: {
                    uProjection: 0,
                    uView: 1,
                    uCenter: 2,
                    uSize: 3,
                    uAnchor: 4,
                    uTexture: 5,
                    uHasTexture: 6,
                    uMaterialColor: 7,
                    uRoughness: 8,
                    uSpecular: 9,
                    uUnlit: 10,
                    uMaterialEmissive: 11,
                    uAlphaThreshold: 12
                },
                attributes: {aPosition: 0, aTexCoord: 2}
            }
        }
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
    const renderer = new WebGLSprite3DRenderer()
    renderer.init({gl, shaderRegistry, textureManager})
    return {renderer, gl}
}


describe('WebGLSprite3DRenderer', () => {

    test('extends WebGLObjectRenderer', () => {
        const renderer = new WebGLSprite3DRenderer()
        expect(renderer).toBeInstanceOf(WebGLObjectRenderer)
    })


    test('handles Sprite3D', () => {
        expect(WebGLSprite3DRenderer.handles).toContain(Sprite3D)
        expect(WebGLSprite3DRenderer.handles.length).toBe(1)
    })


    test('camera3d getter/setter', () => {
        const renderer = new WebGLSprite3DRenderer()
        expect(renderer.camera3d).toBe(null)
        const cam = {}
        renderer.camera3d = cam
        expect(renderer.camera3d).toBe(cam)
    })


    test('gBuffer getter/setter', () => {
        const renderer = new WebGLSprite3DRenderer()
        expect(renderer.gBuffer).toBe(null)
        const gb = {}
        renderer.gBuffer = gb
        expect(renderer.gBuffer).toBe(gb)
    })

})


test('flush is a no-op', () => {
    const {renderer, gl} = createRenderer()
    gl.calls.length = 0
    renderer.flush()
    expect(gl.calls.length).toBe(0)
})


describe('flushToGBuffer', () => {

    test('does nothing with no collected items', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})
        renderer.gBuffer = {resume () {}, end () {}}
        gl.calls.length = 0

        renderer.flushToGBuffer(gl)

        expect(gl.calls.filter(c => c === 'useProgram').length).toBe(0)
    })


    test('does nothing without camera', () => {
        const {renderer, gl} = createRenderer()
        renderer.gBuffer = {resume () {}, end () {}}

        const sprite = new Sprite3D({texture: {id: 'tex'}})
        sprite.updateWorldMatrix()
        renderer.collect(sprite, 1, sprite.renderHints)

        gl.calls.length = 0
        renderer.flushToGBuffer(gl)

        expect(gl.calls.filter(c => c === 'useProgram').length).toBe(0)
    })


    test('does nothing without gBuffer', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        const sprite = new Sprite3D({texture: {id: 'tex'}})
        sprite.updateWorldMatrix()
        renderer.collect(sprite, 1, sprite.renderHints)

        gl.calls.length = 0
        renderer.flushToGBuffer(gl)

        expect(gl.calls.filter(c => c === 'useProgram').length).toBe(0)
    })


    test('draws collected sprite3Ds', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})

        let gBufferResumed = false
        let gBufferEnded = false
        renderer.gBuffer = {
            resume () {
                gBufferResumed = true
            },
            end () {
                gBufferEnded = true
            }
        }

        const sprite = new Sprite3D({texture: {id: 'tex'}, width: 2, height: 3})
        sprite.updateWorldMatrix()
        renderer.collect(sprite, 1, sprite.renderHints)

        gl.calls.length = 0
        renderer.flushToGBuffer(gl)

        expect(gBufferResumed).toBe(true)
        expect(gBufferEnded).toBe(true)
        expect(gl.calls.includes('drawElements')).toBe(true)
    })


    test('applies material uniforms', () => {
        const {renderer, gl} = createRenderer()
        renderer.camera3d = new Camera3D({z: 5})
        renderer.gBuffer = {resume () {}, end () {}}

        const mat = new Material3D({roughness: 0.9, specular: 0.1})
        const sprite = new Sprite3D({material: mat})
        sprite.updateWorldMatrix()
        renderer.collect(sprite, 1, sprite.renderHints)

        gl.calls.length = 0
        renderer.flushToGBuffer(gl)

        expect(gl.calls.includes('drawElements')).toBe(true)
    })

})


test('dispose cleans up', () => {
    const {renderer} = createRenderer()
    renderer.camera3d = {}
    renderer.gBuffer = {}
    renderer.dispose()
    expect(renderer.camera3d).toBe(null)
    expect(renderer.gBuffer).toBe(null)
})
