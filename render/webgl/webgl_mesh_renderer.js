import WebGLObjectRenderer from './webgl_object_renderer.js'
import MeshInstance from '../mesh_instance.js'
import {MESH_SHADER_DEF} from '../shaders/builtin/mesh_shader.js'


export default class WebGLMeshRenderer extends WebGLObjectRenderer {

    #meshProgram = null
    #camera3d = null
    #lightDirection = [0.5, 1.0, 0.3]
    #ambient = 0.3
    #fogNear = 20
    #fogFar = 80
    #fogColor = [0.0, 0.0, 0.0]

    static get handles () {
        return [MeshInstance]
    }


    get camera3d () {
        return this.#camera3d
    }


    set camera3d (camera) {
        this.#camera3d = camera
    }


    get lightDirection () {
        return this.#lightDirection
    }


    set lightDirection (dir) {
        this.#lightDirection = dir
    }


    get ambient () {
        return this.#ambient
    }


    set ambient (value) {
        this.#ambient = value
    }


    get fogNear () {
        return this.#fogNear
    }


    set fogNear (value) {
        this.#fogNear = value
    }


    get fogFar () {
        return this.#fogFar
    }


    set fogFar (value) {
        this.#fogFar = value
    }


    get fogColor () {
        return this.#fogColor
    }


    set fogColor (value) {
        this.#fogColor = value
    }


    init (context) {
        super.init(context)
        this.#meshProgram = context.shaderRegistry.register('mesh', MESH_SHADER_DEF)
    }


    flush () {
        if (this.collected.length === 0 || !this.#camera3d) {
            return
        }

        const gl = this.gl

        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.clear(gl.DEPTH_BUFFER_BIT)

        this.#setupUniforms(gl)

        for (const {object, hints} of this.collected) {
            this.#drawItem(gl, object, hints)
        }

        gl.disable(gl.DEPTH_TEST)
    }


    #setupUniforms (gl) {
        const program = this.#meshProgram

        gl.useProgram(program.program)

        gl.uniformMatrix4fv(program.uniforms.uProjection, false, this.#camera3d.projectionMatrix.elements)
        gl.uniformMatrix4fv(program.uniforms.uView, false, this.#camera3d.viewMatrix.elements)
        gl.uniform3fv(program.uniforms.uLightDirection, this.#lightDirection)
        gl.uniform1f(program.uniforms.uAmbient, this.#ambient)
        gl.uniform4f(program.uniforms.uTintColor, 0, 0, 0, 0)
        gl.uniform1f(program.uniforms.uFogNear, this.#fogNear)
        gl.uniform1f(program.uniforms.uFogFar, this.#fogFar)
        gl.uniform3fv(program.uniforms.uFogColor, this.#fogColor)

        gl.activeTexture(gl.TEXTURE0)
        gl.uniform1i(program.uniforms.uTexture, 0)
    }


    #drawItem (gl, object, hints) { // eslint-disable-line complexity -- clean
        if (!object.mesh || !object.visible) {
            return
        }

        gl.uniformMatrix4fv(this.#meshProgram.uniforms.uModel, false, object.worldMatrix.elements)

        if (hints?.tint) {
            const t = hints.tint
            gl.uniform4f(this.#meshProgram.uniforms.uTintColor, t.r ?? 0, t.g ?? 0, t.b ?? 0, t.a ?? 0)
        }

        if (object.texture) {
            gl.bindTexture(gl.TEXTURE_2D, this.context.textureManager.acquire(object.texture))
        }

        object.mesh.draw()

        if (object.texture) {
            this.context.textureManager.release(object.texture)
        }
    }


    dispose () {
        this.#meshProgram = null
        this.#camera3d = null
        super.dispose()
    }

}
