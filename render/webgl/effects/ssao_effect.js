import {SSAO_SHADER_DEF, SSAO_BLUR_SHADER_DEF} from '../../shaders/builtin/ssao_shader.js'
import {createScreenTexture, createFBO} from './texture_helpers.js'


export default class SsaoEffect {

    #program = null
    #blurProgram = null
    #enabled = false
    #fbo = null
    #texture = null
    #blurFBO = null
    #blurTexture = null
    #radius = 0.5
    #bias = 0.025
    #intensity = 1.5

    get enabled () {
        return this.#enabled
    }

    set enabled (v) {
        this.#enabled = v
    }

    get radius () {
        return this.#radius
    }

    set radius (v) {
        this.#radius = v
    }

    get bias () {
        return this.#bias
    }

    set bias (v) {
        this.#bias = v
    }

    get intensity () {
        return this.#intensity
    }

    set intensity (v) {
        this.#intensity = v
    }

    get outputTexture () {
        return this.#blurTexture
    }


    init (shaderRegistry) {
        this.#program = shaderRegistry.register('ssao', SSAO_SHADER_DEF)
        this.#blurProgram = shaderRegistry.register('ssaoBlur', SSAO_BLUR_SHADER_DEF)
    }


    render (gl, ctx) {
        const hw = Math.ceil(ctx.canvasWidth / 2)
        const hh = Math.ceil(ctx.canvasHeight / 2)

        this.#ensureFBOs(gl, hw, hh)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fbo)
        gl.viewport(0, 0, hw, hh)
        gl.disable(gl.DEPTH_TEST)

        const program = this.#program
        gl.useProgram(program.program)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, ctx.gBuffer.depthTexture)
        gl.uniform1i(program.uniforms.uDepth, 0)

        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, ctx.gBuffer.normalTexture)
        gl.uniform1i(program.uniforms.uGNormal, 1)

        gl.uniformMatrix4fv(program.uniforms.uProjection, false, ctx.camera3d.projectionMatrix.elements)
        gl.uniformMatrix4fv(program.uniforms.uInverseViewProjection, false, ctx.inverseVP.elements)
        gl.uniformMatrix4fv(program.uniforms.uView, false, ctx.camera3d.viewMatrix.elements)
        gl.uniform2f(program.uniforms.uTexelSize, 1 / hw, 1 / hh)
        gl.uniform1f(program.uniforms.uRadius, this.#radius)
        gl.uniform1f(program.uniforms.uBias, this.#bias)
        gl.uniform1f(program.uniforms.uIntensity, this.#intensity)

        ctx.fullscreenQuad.draw(gl, program)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#blurFBO)
        gl.viewport(0, 0, hw, hh)

        const blur = this.#blurProgram
        gl.useProgram(blur.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.#texture)
        gl.uniform1i(blur.uniforms.uSSAOTexture, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, ctx.gBuffer.depthTexture)
        gl.uniform1i(blur.uniforms.uDepth, 1)
        gl.uniform2f(blur.uniforms.uTexelSize, 1 / hw, 1 / hh)
        ctx.fullscreenQuad.draw(gl, blur)

        gl.enable(gl.DEPTH_TEST)
    }


    #ensureFBOs (gl, width, height) {
        if (this.#fbo && this.#texture) {
            return
        }

        this.#texture = createScreenTexture(gl, width, height)
        this.#fbo = createFBO(gl, this.#texture)

        this.#blurTexture = createScreenTexture(gl, width, height)
        this.#blurFBO = createFBO(gl, this.#blurTexture)
    }


    dispose (gl) {
        if (this.#fbo) {
            gl.deleteFramebuffer(this.#fbo)
            gl.deleteTexture(this.#texture)
            gl.deleteFramebuffer(this.#blurFBO)
            gl.deleteTexture(this.#blurTexture)
            this.#fbo = null
            this.#texture = null
            this.#blurFBO = null
            this.#blurTexture = null
        }
        this.#program = null
        this.#blurProgram = null
    }

}
