import ShaderProgram from './shader_program.js'


export default class ShaderRegistry {

    #gl = null
    #programs = new Map()
    #defaults = new Map()

    constructor (gl) {
        this.#gl = gl
    }


    register (id, {vertex, fragment, uniforms = [], attributes = []}) {
        const program = new ShaderProgram(this.#gl, vertex, fragment)

        for (const name of uniforms) {
            program.registerUniform(name)
        }

        for (const name of attributes) {
            program.registerAttribute(name)
        }

        this.#programs.set(id, program)
        return program
    }


    get (id) {
        return this.#programs.get(id) || null
    }


    has (id) {
        return this.#programs.has(id)
    }


    setDefault (type, id) {
        this.#defaults.set(type, id)
        return this
    }


    getDefault (type) {
        const id = this.#defaults.get(type)
        return id ? this.get(id) : null
    }


    unregister (id) {
        const program = this.#programs.get(id)

        if (program) {
            program.dispose()
            this.#programs.delete(id)

            for (const [type, defaultId] of this.#defaults) {
                if (defaultId === id) {
                    this.#defaults.delete(type)
                }
            }
        }

        return this
    }


    dispose () {
        for (const program of this.#programs.values()) {
            program.dispose()
        }

        this.#programs.clear()
        this.#defaults.clear()
        this.#gl = null
    }

}
