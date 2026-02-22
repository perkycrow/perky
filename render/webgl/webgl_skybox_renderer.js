import WebGLObjectRenderer from './webgl_object_renderer.js'
import Geometry from '../geometry.js'
import Mesh from '../mesh.js'
import {SKYBOX_SHADER_DEF} from '../shaders/builtin/skybox_shader.js'


export default class WebGLSkyboxRenderer extends WebGLObjectRenderer {

    #program = null
    #boxMesh = null
    #camera3d = null
    #skybox = null
    #viewRotation = new Float32Array(16)

    static get handles () {
        return []
    }


    get camera3d () {
        return this.#camera3d
    }


    set camera3d (camera) {
        this.#camera3d = camera
    }


    get skybox () {
        return this.#skybox
    }


    set skybox (value) {
        this.#skybox = value
    }


    init (context) {
        super.init(context)
        this.#program = context.shaderRegistry.register('skybox', SKYBOX_SHADER_DEF)
        this.#boxMesh = createSkyboxMesh(context.gl)
    }


    flush () {
        if (!this.#skybox || !this.#camera3d) {
            return
        }

        const gl = this.gl

        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.depthMask(false)
        gl.enable(gl.CULL_FACE)
        gl.cullFace(gl.FRONT)

        gl.useProgram(this.#program.program)

        this.#uploadViewRotation(gl)
        gl.uniformMatrix4fv(this.#program.uniforms.uProjection, false, this.#camera3d.projectionMatrix.elements)

        gl.uniform3fv(this.#program.uniforms.uSkyColor, this.#skybox.skyColor)
        gl.uniform3fv(this.#program.uniforms.uHorizonColor, this.#skybox.horizonColor)
        gl.uniform3fv(this.#program.uniforms.uGroundColor, this.#skybox.groundColor)
        gl.uniform1f(this.#program.uniforms.uHasCubemap, this.#skybox.cubemap ? 1 : 0)

        this.#boxMesh.draw()

        gl.disable(gl.CULL_FACE)
        gl.depthMask(true)
        gl.disable(gl.DEPTH_TEST)
    }


    dispose () {
        if (this.#boxMesh) {
            this.#boxMesh.dispose()
            this.#boxMesh = null
        }
        this.#program = null
        this.#camera3d = null
        this.#skybox = null
        super.dispose()
    }


    #uploadViewRotation (gl) {
        const src = this.#camera3d.viewMatrix.elements
        const dst = this.#viewRotation
        dst[0] = src[0]
        dst[1] = src[1]
        dst[2] = src[2]
        dst[3] = src[3]
        dst[4] = src[4]
        dst[5] = src[5]
        dst[6] = src[6]
        dst[7] = src[7]
        dst[8] = src[8]
        dst[9] = src[9]
        dst[10] = src[10]
        dst[11] = src[11]
        dst[12] = 0
        dst[13] = 0
        dst[14] = 0
        dst[15] = 1
        gl.uniformMatrix4fv(this.#program.uniforms.uViewRotation, false, dst)
    }

}


function createSkyboxMesh (gl) {
    const geo = Geometry.createBox(1, 1, 1)
    return new Mesh(gl, geo)
}
