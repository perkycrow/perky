import logger from '../../core/logger.js'


export default class FullscreenQuad {

    #vertexBuffer = null
    #texCoordBuffer = null

    constructor (gl) {
        this.#createBuffers(gl)
    }


    #createBuffers (gl) {
        const vertices = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ])

        const texCoords = new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ])

        this.#vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

        this.#texCoordBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)
    }


    draw (gl, program) {
        const positionAttr = program.attributes.aPosition
        const texCoordAttr = program.attributes.aTexCoord

        if (positionAttr === undefined || positionAttr === -1) {
            logger.warn('FullscreenQuad: aPosition attribute not found')
            return
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBuffer)
        gl.enableVertexAttribArray(positionAttr)
        gl.vertexAttribPointer(positionAttr, 2, gl.FLOAT, false, 0, 0)

        if (texCoordAttr !== undefined && texCoordAttr !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.#texCoordBuffer)
            gl.enableVertexAttribArray(texCoordAttr)
            gl.vertexAttribPointer(texCoordAttr, 2, gl.FLOAT, false, 0, 0)
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }


    dispose (gl) {
        if (this.#vertexBuffer) {
            gl.deleteBuffer(this.#vertexBuffer)
            this.#vertexBuffer = null
        }
        if (this.#texCoordBuffer) {
            gl.deleteBuffer(this.#texCoordBuffer)
            this.#texCoordBuffer = null
        }
    }

}
