import {VOLUMETRIC_FOG_SHADER_DEF, FOG_BLUR_SHADER_DEF} from '../../shaders/builtin/volumetric_fog_shader.js'
import {createScreenTexture, createHdrTexture} from './texture_helpers.js'


export default class VolumetricFogEffect {

    #fogProgram = null
    #blurProgram = null
    #enabled = false
    #fogFBO = null
    #fogTexture = null
    #blurFBO = null
    #blurTexture = null
    #fboWidth = 0
    #fboHeight = 0
    #density = 0.05
    #heightFalloff = 0.2
    #baseHeight = 0.0
    #noiseScale = 0.1
    #noiseStrength = 0.5
    #windDirection = [1.0, 0.0]
    #windSpeed = 0.5
    #scatterAnisotropy = 0.3
    #steps = 16
    #maxDistance = 80
    #startDistance = 3
    #time = 0

    get enabled () {
        return this.#enabled
    }


    set enabled (v) {
        this.#enabled = v
    }


    get density () {
        return this.#density
    }


    set density (v) {
        this.#density = v
    }


    get heightFalloff () {
        return this.#heightFalloff
    }


    set heightFalloff (v) {
        this.#heightFalloff = v
    }


    get baseHeight () {
        return this.#baseHeight
    }


    set baseHeight (v) {
        this.#baseHeight = v
    }


    get noiseScale () {
        return this.#noiseScale
    }


    set noiseScale (v) {
        this.#noiseScale = v
    }


    get noiseStrength () {
        return this.#noiseStrength
    }


    set noiseStrength (v) {
        this.#noiseStrength = v
    }


    get windDirection () {
        return this.#windDirection
    }


    set windDirection (v) {
        this.#windDirection = v
    }


    get windSpeed () {
        return this.#windSpeed
    }


    set windSpeed (v) {
        this.#windSpeed = v
    }


    get scatterAnisotropy () {
        return this.#scatterAnisotropy
    }


    set scatterAnisotropy (v) {
        this.#scatterAnisotropy = v
    }


    get steps () {
        return this.#steps
    }


    set steps (v) {
        this.#steps = v
    }


    get maxDistance () {
        return this.#maxDistance
    }


    set maxDistance (v) {
        this.#maxDistance = v
    }


    get startDistance () {
        return this.#startDistance
    }


    set startDistance (v) {
        this.#startDistance = v
    }


    get time () {
        return this.#time
    }


    set time (v) {
        this.#time = v
    }


    init (shaderRegistry) {
        this.#fogProgram = shaderRegistry.register('volumetricFog', VOLUMETRIC_FOG_SHADER_DEF)
        this.#blurProgram = shaderRegistry.register('fogBlur', FOG_BLUR_SHADER_DEF)
    }


    render (gl, ctx, sceneTexture) {
        const fw = Math.ceil(ctx.canvasWidth / 2)
        const fh = Math.ceil(ctx.canvasHeight / 2)

        this.#ensureFBOs({gl, fw, fh, fullW: ctx.canvasWidth, fullH: ctx.canvasHeight})

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fogFBO)
        gl.viewport(0, 0, fw, fh)
        gl.disable(gl.DEPTH_TEST)

        const program = this.#fogProgram
        gl.useProgram(program.program)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, ctx.gBuffer.depthTexture)
        gl.uniform1i(program.uniforms.uDepth, 0)

        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, ctx.lightDataTexture.texture)
        gl.uniform1i(program.uniforms.uLightData, 1)

        gl.uniformMatrix4fv(program.uniforms.uInverseViewProjection, false, ctx.inverseVP.elements)
        gl.uniform3f(program.uniforms.uCameraPosition, ctx.camera3d.position.x, ctx.camera3d.position.y, ctx.camera3d.position.z)
        gl.uniform1i(program.uniforms.uNumLights, ctx.numLights)
        gl.uniform1f(program.uniforms.uTime, this.#time)

        gl.uniform1f(program.uniforms.uFogDensity, this.#density)
        gl.uniform1f(program.uniforms.uFogHeightFalloff, this.#heightFalloff)
        gl.uniform1f(program.uniforms.uFogBaseHeight, this.#baseHeight)
        gl.uniform1f(program.uniforms.uFogNoiseScale, this.#noiseScale)
        gl.uniform1f(program.uniforms.uFogNoiseStrength, this.#noiseStrength)
        gl.uniform2fv(program.uniforms.uFogWindDirection, this.#windDirection)
        gl.uniform1f(program.uniforms.uFogWindSpeed, this.#windSpeed)
        gl.uniform1f(program.uniforms.uFogScatterAnisotropy, this.#scatterAnisotropy)
        gl.uniform3fv(program.uniforms.uFogColor, ctx.fogColor)
        gl.uniform1i(program.uniforms.uFogSteps, this.#steps)
        gl.uniform1f(program.uniforms.uFogMaxDistance, this.#maxDistance)
        gl.uniform1f(program.uniforms.uFogStartDistance, this.#startDistance)

        ctx.fullscreenQuad.draw(gl, program)

        const fullW = ctx.canvasWidth
        const fullH = ctx.canvasHeight
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#blurFBO)
        gl.viewport(0, 0, fullW, fullH)

        const blur = this.#blurProgram
        gl.useProgram(blur.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.#fogTexture)
        gl.uniform1i(blur.uniforms.uFogTexture, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
        gl.uniform1i(blur.uniforms.uSceneColor, 1)
        gl.activeTexture(gl.TEXTURE2)
        gl.bindTexture(gl.TEXTURE_2D, ctx.gBuffer.depthTexture)
        gl.uniform1i(blur.uniforms.uDepth, 2)
        gl.uniform2f(blur.uniforms.uTexelSize, 1 / fullW, 1 / fullH)
        ctx.fullscreenQuad.draw(gl, blur)

        gl.enable(gl.DEPTH_TEST)

        return this.#blurTexture
    }


    #ensureFBOs ({gl, fw, fh, fullW, fullH}) {
        if (this.#fogFBO && this.#fboWidth === fw && this.#fboHeight === fh) {
            return
        }

        if (this.#fogFBO) {
            gl.deleteFramebuffer(this.#fogFBO)
            gl.deleteTexture(this.#fogTexture)
            gl.deleteFramebuffer(this.#blurFBO)
            gl.deleteTexture(this.#blurTexture)
        }

        this.#fogTexture = createHdrTexture(gl, fw, fh)
        this.#fogFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fogFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#fogTexture, 0)

        this.#blurTexture = createScreenTexture(gl, fullW, fullH)
        this.#blurFBO = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#blurFBO)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#blurTexture, 0)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        this.#fboWidth = fw
        this.#fboHeight = fh
    }


    dispose (gl) {
        if (this.#fogFBO) {
            gl.deleteFramebuffer(this.#fogFBO)
            gl.deleteTexture(this.#fogTexture)
            gl.deleteFramebuffer(this.#blurFBO)
            gl.deleteTexture(this.#blurTexture)
            this.#fogFBO = null
            this.#fogTexture = null
            this.#blurFBO = null
            this.#blurTexture = null
        }
        this.#fogProgram = null
        this.#blurProgram = null
    }

}
