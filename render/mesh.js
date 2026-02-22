export default class Mesh {

    #gl = null
    #vao = null
    #positionBuffer = null
    #normalBuffer = null
    #uvBuffer = null
    #tangentBuffer = null
    #indexBuffer = null
    #indexCount = 0
    #disposed = false

    constructor (gl, geometry) {
        this.#gl = gl
        this.#indexCount = geometry.indexCount
        this.#createBuffers(geometry)
    }


    get indexCount () {
        return this.#indexCount
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
        this.#gl.drawElements(this.#gl.TRIANGLES, this.#indexCount, this.#gl.UNSIGNED_SHORT, 0)
        this.unbind()
    }


    dispose () {
        if (this.#disposed) {
            return
        }

        const gl = this.#gl

        gl.deleteBuffer(this.#positionBuffer)
        gl.deleteBuffer(this.#normalBuffer)
        gl.deleteBuffer(this.#uvBuffer)
        if (this.#tangentBuffer) {
            gl.deleteBuffer(this.#tangentBuffer)
        }
        gl.deleteBuffer(this.#indexBuffer)
        gl.deleteVertexArray(this.#vao)

        this.#disposed = true
    }


    #createBuffers (geometry) {
        const gl = this.#gl

        this.#vao = gl.createVertexArray()
        gl.bindVertexArray(this.#vao)

        this.#positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW)
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)

        this.#normalBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW)
        gl.enableVertexAttribArray(1)
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0)

        this.#uvBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#uvBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, geometry.uvs, gl.STATIC_DRAW)
        gl.enableVertexAttribArray(2)
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0)

        if (geometry.tangents) {
            this.#tangentBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, this.#tangentBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, geometry.tangents, gl.STATIC_DRAW)
            gl.enableVertexAttribArray(3)
            gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, 0)
        }

        this.#indexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.#indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW)

        gl.bindVertexArray(null)
    }

}
