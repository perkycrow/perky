import {OUTLINE_SHADER_DEF} from '../../shaders/builtin/outline_shader.js'
import {createScreenTexture, createFBO} from './texture_helpers.js'


export default class OutlineEffect {

    #program = null
    #enabled = false
    #fbo = null
    #texture = null
    #color = [0.0, 0.0, 0.0]
    #depthThreshold = 0.001
    #normalThreshold = 0.3

    get enabled () {
        return this.#enabled
    }

    set enabled (v) {
        this.#enabled = v
    }

    get color () {
        return this.#color
    }

    set color (v) {
        this.#color = v
    }

    get depthThreshold () {
        return this.#depthThreshold
    }

    set depthThreshold (v) {
        this.#depthThreshold = v
    }

    get normalThreshold () {
        return this.#normalThreshold
    }

    set normalThreshold (v) {
        this.#normalThreshold = v
    }


    init (shaderRegistry) {
        this.#program = shaderRegistry.register('outline', OUTLINE_SHADER_DEF)
    }


    render (gl, ctx, sceneTexture) {
        const w = ctx.canvasWidth
        const h = ctx.canvasHeight

        if (!this.#fbo) {
            this.#texture = createScreenTexture(gl, w, h)
            this.#fbo = createFBO(gl, this.#texture)
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fbo)
        gl.viewport(0, 0, w, h)
        gl.disable(gl.DEPTH_TEST)

        const program = this.#program
        gl.useProgram(program.program)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
        gl.uniform1i(program.uniforms.uSceneColor, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, ctx.gBuffer.depthTexture)
        gl.uniform1i(program.uniforms.uDepth, 1)
        gl.activeTexture(gl.TEXTURE2)
        gl.bindTexture(gl.TEXTURE_2D, ctx.gBuffer.normalTexture)
        gl.uniform1i(program.uniforms.uGNormal, 2)
        gl.uniform2f(program.uniforms.uTexelSize, 1 / w, 1 / h)
        gl.uniform3fv(program.uniforms.uOutlineColor, this.#color)
        gl.uniform1f(program.uniforms.uDepthThreshold, this.#depthThreshold)
        gl.uniform1f(program.uniforms.uNormalThreshold, this.#normalThreshold)

        ctx.fullscreenQuad.draw(gl, program)

        gl.enable(gl.DEPTH_TEST)

        return this.#texture
    }


    dispose (gl) {
        if (this.#fbo) {
            gl.deleteFramebuffer(this.#fbo)
            gl.deleteTexture(this.#texture)
            this.#fbo = null
            this.#texture = null
        }
        this.#program = null
    }

}
