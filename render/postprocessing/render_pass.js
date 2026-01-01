export default class RenderPass {

    static shaderDefinition = null
    static defaultUniforms = {}
    static uniformConfig = {}

    #enabled = true
    #program = null
    #uniforms = {}

    constructor () {
        this.#uniforms = {...this.constructor.defaultUniforms}
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


    init (shaderRegistry) {
        const definition = this.constructor.shaderDefinition
        if (!definition) {
            throw new Error(`${this.constructor.name}.shaderDefinition must be defined`)
        }

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

        this.applyUniforms()

        fullscreenQuad.draw(gl, this.#program)
    }


    applyUniforms () {
        for (const [name, value] of Object.entries(this.#uniforms)) {
            this.#applyUniform(name, value)
        }
    }


    #applyUniform (name, value) {
        if (typeof value === 'number') {
            this.#program.setUniform1f(name, value)
            return
        }

        if (!Array.isArray(value)) {
            return
        }

        const setters = {
            2: () => this.#program.setUniform2f(name, value[0], value[1]),
            3: () => this.#program.setUniform3f(name, value[0], value[1], value[2]),
            4: () => this.#program.setUniform4f(name, value)
        }

        setters[value.length]?.()
    }


    dispose () {
        this.#program = null
        this.#uniforms = {}
    }

}
