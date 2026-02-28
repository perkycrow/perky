export default class LineMesh {

    #gl = null
    #vao = null
    #positionBuffer = null
    #vertexCount = 0
    #disposed = false

    constructor ({gl, positions}) {
        this.#gl = gl
        this.#vertexCount = positions.length / 3
        this.#createBuffers(positions)
    }


    get vertexCount () {
        return this.#vertexCount
    }


    get disposed () {
        return this.#disposed
    }


    bind () {
        this.#gl.bindVertexArray(this.#vao)
    }


    unbind () {
        this.#gl.bindVertexArray(null)
    }


    draw () {
        this.bind()
        this.#gl.drawArrays(this.#gl.LINES, 0, this.#vertexCount)
        this.unbind()
    }


    dispose () {
        if (this.#disposed) {
            return
        }

        const gl = this.#gl

        gl.deleteBuffer(this.#positionBuffer)
        gl.deleteVertexArray(this.#vao)

        this.#disposed = true
    }


    #createBuffers (positions) {
        const gl = this.#gl

        this.#vao = gl.createVertexArray()
        gl.bindVertexArray(this.#vao)

        this.#positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)

        gl.bindVertexArray(null)
    }

}
