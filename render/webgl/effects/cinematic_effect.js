import {CINEMATIC_SHADER_DEF} from '../../shaders/builtin/cinematic_shader.js'


export default class CinematicEffect {

    #program = null
    #enabled = false
    #vignetteIntensity = 0.4
    #vignetteSmoothness = 0.8
    #saturation = 1.0
    #temperature = 0.0
    #brightness = 1.0
    #contrast = 1.0
    #grainIntensity = 0.0
    #colorLevels = 0
    #paperIntensity = 0.0
    #paperTexture = null

    get enabled () {
        return this.#enabled
    }


    set enabled (v) {
        this.#enabled = v
    }


    get vignetteIntensity () {
        return this.#vignetteIntensity
    }


    set vignetteIntensity (v) {
        this.#vignetteIntensity = v
    }


    get vignetteSmoothness () {
        return this.#vignetteSmoothness
    }


    set vignetteSmoothness (v) {
        this.#vignetteSmoothness = v
    }


    get saturation () {
        return this.#saturation
    }


    set saturation (v) {
        this.#saturation = v
    }


    get temperature () {
        return this.#temperature
    }


    set temperature (v) {
        this.#temperature = v
    }


    get brightness () {
        return this.#brightness
    }


    set brightness (v) {
        this.#brightness = v
    }


    get contrast () {
        return this.#contrast
    }


    set contrast (v) {
        this.#contrast = v
    }


    get grainIntensity () {
        return this.#grainIntensity
    }


    set grainIntensity (v) {
        this.#grainIntensity = v
    }


    get colorLevels () {
        return this.#colorLevels
    }


    set colorLevels (v) {
        this.#colorLevels = v
    }


    get paperIntensity () {
        return this.#paperIntensity
    }


    set paperIntensity (v) {
        this.#paperIntensity = v
    }


    init (shaderRegistry, gl) {
        this.#program = shaderRegistry.register('cinematic', CINEMATIC_SHADER_DEF)
        this.#paperTexture = createPaperTexture(gl)
    }


    render (gl, ctx, sceneTexture, time) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, ctx.canvasWidth, ctx.canvasHeight)
        gl.disable(gl.DEPTH_TEST)

        const program = this.#program
        gl.useProgram(program.program)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture)
        gl.uniform1i(program.uniforms.uSceneColor, 0)
        gl.uniform1f(program.uniforms.uTime, time)
        gl.uniform1f(program.uniforms.uVignetteIntensity, this.#vignetteIntensity)
        gl.uniform1f(program.uniforms.uVignetteSmoothness, this.#vignetteSmoothness)
        gl.uniform1f(program.uniforms.uSaturation, this.#saturation)
        gl.uniform1f(program.uniforms.uTemperature, this.#temperature)
        gl.uniform1f(program.uniforms.uBrightness, this.#brightness)
        gl.uniform1f(program.uniforms.uContrast, this.#contrast)
        gl.uniform1f(program.uniforms.uGrainIntensity, this.#grainIntensity)
        gl.uniform1f(program.uniforms.uPaperIntensity, this.#paperIntensity)
        gl.uniform1f(program.uniforms.uColorLevels, this.#colorLevels)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.#paperTexture)
        gl.uniform1i(program.uniforms.uPaperTexture, 1)

        ctx.fullscreenQuad.draw(gl, program)

        gl.enable(gl.DEPTH_TEST)
    }


    dispose (gl) {
        if (this.#paperTexture) {
            gl.deleteTexture(this.#paperTexture)
            this.#paperTexture = null
        }
        this.#program = null
    }

}


function createPaperTexture (gl) {
    const size = 256
    const data = new Uint8Array(size * size)
    let seed = 1
    const rand = () => {
        seed = (seed * 16807) % 2147483647
        return seed / 2147483647
    }
    for (let i = 0; i < size * size; i++) {
        const r1 = rand()
        const r2 = rand()
        const value = 0.7 + (r1 - 0.5) * 0.25 + (r2 - 0.5) * 0.15
        data[i] = Math.max(0, Math.min(255, value * 255))
    }
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, size, size, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
}
