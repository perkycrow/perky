export default class RenderPass {

    #enabled = true
    #program = null
    #uniforms = {}


    constructor () {
        this.#uniforms = this.getDefaultUniforms()
    }


    get enabled () {
        return this.#enabled
    }


    set enabled (value) {
        this.#enabled = value
    }


    get program () {
        return this.#program
    }


    get uniforms () {
        return this.#uniforms
    }


    getDefaultUniforms () { // eslint-disable-line class-methods-use-this
        return {}
    }


    getUniformConfig () { // eslint-disable-line class-methods-use-this
        return {}
    }


    getShaderDefinition () { // eslint-disable-line class-methods-use-this
        throw new Error('RenderPass.getShaderDefinition() must be implemented')
    }


    init (gl, shaderRegistry) {
        const definition = this.getShaderDefinition()
        const id = `pass_${this.constructor.name}_${Date.now()}`

        this.#program = shaderRegistry.register(id, definition)
    }


    setUniform (name, value) {
        this.#uniforms[name] = value
        return this
    }


    render (gl, inputTexture, fullscreenQuad) {
        if (!this.#enabled || !this.#program) {
            return
        }

        this.#program.use()

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, inputTexture)
        this.#program.setUniform1i('uTexture', 0)

        this.applyUniforms(gl)

        fullscreenQuad.draw(gl, this.#program)
    }


    applyUniforms (gl) {
        for (const [name, value] of Object.entries(this.#uniforms)) {
            if (typeof value === 'number') {
                this.#program.setUniform1f(name, value)
            } else if (Array.isArray(value)) {
                if (value.length === 2) {
                    this.#program.setUniform2f(name, value[0], value[1])
                } else if (value.length === 3) {
                    this.#program.setUniform3f(name, value[0], value[1], value[2])
                } else if (value.length === 4) {
                    this.#program.setUniform4f(name, value[0], value[1], value[2], value[3])
                }
            }
        }
    }


    dispose () {
        this.#program = null
        this.#uniforms = {}
    }

}
