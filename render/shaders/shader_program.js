export default class ShaderProgram {

    #gl = null
    #program = null
    #uniforms = {}
    #attributes = {}


    constructor (gl, vertexSource, fragmentSource) {
        this.#gl = gl
        this.#program = this.#createProgram(vertexSource, fragmentSource)
    }


    get program () {
        return this.#program
    }


    get uniforms () {
        return this.#uniforms
    }


    get attributes () {
        return this.#attributes
    }


    #createShader (type, source) {
        const gl = this.#gl
        const shader = gl.createShader(type)

        gl.shaderSource(shader, source)
        gl.compileShader(shader)

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader)
            gl.deleteShader(shader)
            throw new Error(`Shader compilation failed: ${error}`)
        }

        return shader
    }


    #createProgram (vertexSource, fragmentSource) {
        const gl = this.#gl

        const vertexShader = this.#createShader(gl.VERTEX_SHADER, vertexSource)
        const fragmentShader = this.#createShader(gl.FRAGMENT_SHADER, fragmentSource)

        const program = gl.createProgram()
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program)
            gl.deleteProgram(program)
            throw new Error(`Program linking failed: ${error}`)
        }

        gl.deleteShader(vertexShader)
        gl.deleteShader(fragmentShader)

        return program
    }


    registerUniform (name) {
        const location = this.#gl.getUniformLocation(this.#program, name)
        this.#uniforms[name] = location
        return this
    }


    registerAttribute (name) {
        const location = this.#gl.getAttribLocation(this.#program, name)
        this.#attributes[name] = location
        return this
    }


    use () {
        this.#gl.useProgram(this.#program)
        return this
    }


    setUniform1f (name, value) {
        this.#gl.uniform1f(this.#uniforms[name], value)
        return this
    }


    setUniform2f (name, x, y) {
        this.#gl.uniform2f(this.#uniforms[name], x, y)
        return this
    }


    setUniform3f (name, x, y, z) {
        this.#gl.uniform3f(this.#uniforms[name], x, y, z)
        return this
    }


    setUniform4f (name, x, y, z, w) {
        this.#gl.uniform4f(this.#uniforms[name], x, y, z, w)
        return this
    }


    setUniform1i (name, value) {
        this.#gl.uniform1i(this.#uniforms[name], value)
        return this
    }


    setUniformMatrix3fv (name, transpose, value) {
        this.#gl.uniformMatrix3fv(this.#uniforms[name], transpose, value)
        return this
    }


    setUniformMatrix4fv (name, transpose, value) {
        this.#gl.uniformMatrix4fv(this.#uniforms[name], transpose, value)
        return this
    }


    dispose () {
        if (this.#program) {
            this.#gl.deleteProgram(this.#program)
            this.#program = null
        }
        this.#uniforms = {}
        this.#attributes = {}
        this.#gl = null
    }

}
