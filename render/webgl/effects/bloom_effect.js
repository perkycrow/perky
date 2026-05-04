import {BLOOM_EXTRACT_SHADER_DEF, BLOOM_BLUR_SHADER_DEF} from '../../shaders/builtin/bloom_shader.js'
import {createScreenTexture, createFBO} from './texture_helpers.js'


export default class BloomEffect {

    #extractProgram = null
    #blurProgram = null
    #enabled = false
    #extractFBO = null
    #extractTexture = null
    #pingFBO = null
    #pingTexture = null
    #pongFBO = null
    #pongTexture = null
    #fboWidth = 0
    #fboHeight = 0
    #threshold = 0.8
    #softThreshold = 0.5
    #intensity = 0.3
    #passes = 2

    get enabled () {
        return this.#enabled
    }


    set enabled (v) {
        this.#enabled = v
    }


    get threshold () {
        return this.#threshold
    }


    set threshold (v) {
        this.#threshold = v
    }


    get softThreshold () {
        return this.#softThreshold
    }


    set softThreshold (v) {
        this.#softThreshold = v
    }


    get intensity () {
        return this.#intensity
    }


    set intensity (v) {
        this.#intensity = v
    }


    get passes () {
        return this.#passes
    }


    set passes (v) {
        this.#passes = v
    }


    init (shaderRegistry) {
        this.#extractProgram = shaderRegistry.register('bloomExtract', BLOOM_EXTRACT_SHADER_DEF)
        this.#blurProgram = shaderRegistry.register('bloomBlur', BLOOM_BLUR_SHADER_DEF)
    }


    render (gl, ctx, sceneTexture) {
        const bw = Math.ceil(ctx.canvasWidth / 2)
        const bh = Math.ceil(ctx.canvasHeight / 2)

        this.#ensureFBOs(gl, bw, bh)

        gl.disable(gl.DEPTH_TEST)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#extractFBO)
        gl.viewport(0, 0, bw, bh)
        const extract = this.#extractProgram
        gl.useProgram(extract.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
        gl.uniform1i(extract.uniforms.uSceneColor, 0)
        gl.uniform1f(extract.uniforms.uThreshold, this.#threshold)
        gl.uniform1f(extract.uniforms.uSoftThreshold, this.#softThreshold)
        ctx.fullscreenQuad.draw(gl, extract)

        const blur = this.#blurProgram
        gl.useProgram(blur.program)
        gl.uniform2f(blur.uniforms.uTexelSize, 1 / bw, 1 / bh)

        let readTex = this.#extractTexture
        for (let i = 0; i < this.#passes; i++) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.#pingFBO)
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, readTex)
            gl.uniform1i(blur.uniforms.uTexture, 0)
            gl.uniform2f(blur.uniforms.uDirection, 1.0, 0.0)
            ctx.fullscreenQuad.draw(gl, blur)

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.#pongFBO)
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, this.#pingTexture)
            gl.uniform1i(blur.uniforms.uTexture, 0)
            gl.uniform2f(blur.uniforms.uDirection, 0.0, 1.0)
            ctx.fullscreenQuad.draw(gl, blur)

            readTex = this.#pongTexture
        }

        gl.enable(gl.DEPTH_TEST)
    }


    composite (gl, ctx) {
        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        const bi = this.#intensity
        gl.blendColor(bi, bi, bi, 1.0)
        gl.blendFunc(gl.CONSTANT_COLOR, gl.ONE)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, ctx.canvasWidth, ctx.canvasHeight)

        const program = this.#extractProgram
        gl.useProgram(program.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.#pongTexture)
        gl.uniform1i(program.uniforms.uSceneColor, 0)
        gl.uniform1f(program.uniforms.uThreshold, 0.0)
        gl.uniform1f(program.uniforms.uSoftThreshold, 0.0)
        ctx.fullscreenQuad.draw(gl, program)

        gl.disable(gl.BLEND)
        gl.enable(gl.DEPTH_TEST)
    }


    #ensureFBOs (gl, width, height) {
        if (this.#extractFBO && this.#fboWidth === width && this.#fboHeight === height) {
            return
        }

        if (this.#extractFBO) {
            gl.deleteFramebuffer(this.#extractFBO)
            gl.deleteTexture(this.#extractTexture)
            gl.deleteFramebuffer(this.#pingFBO)
            gl.deleteTexture(this.#pingTexture)
            gl.deleteFramebuffer(this.#pongFBO)
            gl.deleteTexture(this.#pongTexture)
        }

        this.#extractTexture = createScreenTexture(gl, width, height)
        this.#extractFBO = createFBO(gl, this.#extractTexture)

        this.#pingTexture = createScreenTexture(gl, width, height)
        this.#pingFBO = createFBO(gl, this.#pingTexture)

        this.#pongTexture = createScreenTexture(gl, width, height)
        this.#pongFBO = createFBO(gl, this.#pongTexture)

        this.#fboWidth = width
        this.#fboHeight = height
    }


    dispose (gl) {
        if (this.#extractFBO) {
            gl.deleteFramebuffer(this.#extractFBO)
            gl.deleteTexture(this.#extractTexture)
            gl.deleteFramebuffer(this.#pingFBO)
            gl.deleteTexture(this.#pingTexture)
            gl.deleteFramebuffer(this.#pongFBO)
            gl.deleteTexture(this.#pongTexture)
            this.#extractFBO = null
            this.#extractTexture = null
            this.#pingFBO = null
            this.#pingTexture = null
            this.#pongFBO = null
            this.#pongTexture = null
        }
        this.#extractProgram = null
        this.#blurProgram = null
    }

}
