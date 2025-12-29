import Image2D from '../image_2d'
import Sprite2D from '../sprite_2d'


const DEFAULT_TEX_COORDS = [0, 1, 1, 1, 1, 0, 0, 0]


export default class WebGLSpriteBatch {

    #tempCorners = new Float32Array(8)
    #tempTexCoords = new Float32Array(8)


    constructor (gl, spriteProgram, textureManager) {
        this.gl = gl
        this.spriteProgram = spriteProgram
        this.textureManager = textureManager

        this.maxSprites = 1000
        this.vertexData = new Float32Array(this.maxSprites * 4 * 5)
        this.indexData = new Uint16Array(this.maxSprites * 6)

        for (let i = 0; i < this.maxSprites; i++) {
            const offset = i * 6
            const vertexOffset = i * 4

            this.indexData[offset + 0] = vertexOffset + 0
            this.indexData[offset + 1] = vertexOffset + 1
            this.indexData[offset + 2] = vertexOffset + 2
            this.indexData[offset + 3] = vertexOffset + 0
            this.indexData[offset + 4] = vertexOffset + 2
            this.indexData[offset + 5] = vertexOffset + 3
        }

        this.vertexBuffer = gl.createBuffer()
        this.indexBuffer = gl.createBuffer()

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData, gl.STATIC_DRAW)

        this.currentTexture = null
        this.spriteCount = 0
        this.vertexIndex = 0
    }


    begin () {
        this.spriteCount = 0
        this.vertexIndex = 0
        this.currentTexture = null
    }


    addSprite (object, effectiveOpacity) { // eslint-disable-line complexity
        let image = null
        let frame = null

        if (object instanceof Image2D) {
            image = object.image
        } else if (object instanceof Sprite2D) {
            image = object.image || (object.currentFrame ? object.currentFrame.image : null)
            frame = object.currentFrame
        }

        if (!image || !image.complete) {
            return
        }

        const texture = this.textureManager.getTexture(image)
        if (!texture) {
            return
        }

        if (this.currentTexture !== texture) {
            this.flush()
            this.currentTexture = texture
        }

        if (this.spriteCount >= this.maxSprites) {
            this.flush()
        }

        const {minX, minY, maxX, maxY} = object.getBounds()
        const m = object.worldMatrix
        const corners = this.#tempCorners
        const texCoords = this.#tempTexCoords

        corners[0] = m[0] * minX + m[2] * minY + m[4]
        corners[1] = m[1] * minX + m[3] * minY + m[5]
        corners[2] = m[0] * maxX + m[2] * minY + m[4]
        corners[3] = m[1] * maxX + m[3] * minY + m[5]
        corners[4] = m[0] * maxX + m[2] * maxY + m[4]
        corners[5] = m[1] * maxX + m[3] * maxY + m[5]
        corners[6] = m[0] * minX + m[2] * maxY + m[4]
        corners[7] = m[1] * minX + m[3] * maxY + m[5]

        if (frame) {
            const {x, y, w, h} = frame.frame
            const iw = image.width
            const ih = image.height
            const u0 = x / iw
            const u1 = (x + w) / iw
            const v0 = y / ih
            const v1 = (y + h) / ih

            texCoords[0] = u0
            texCoords[1] = v1
            texCoords[2] = u1
            texCoords[3] = v1
            texCoords[4] = u1
            texCoords[5] = v0
            texCoords[6] = u0
            texCoords[7] = v0
        } else {
            texCoords.set(DEFAULT_TEX_COORDS)
        }

        for (let i = 0; i < 4; i++) {
            const idx = this.vertexIndex
            const ci = i * 2

            this.vertexData[idx] = corners[ci]
            this.vertexData[idx + 1] = corners[ci + 1]
            this.vertexData[idx + 2] = texCoords[ci]
            this.vertexData[idx + 3] = texCoords[ci + 1]
            this.vertexData[idx + 4] = effectiveOpacity

            this.vertexIndex += 5
        }

        this.spriteCount++
    }


    flush () {
        if (this.spriteCount === 0) {
            return
        }

        const gl = this.gl
        const program = this.spriteProgram

        gl.useProgram(program.program)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.currentTexture)
        gl.uniform1i(program.uniforms.uTexture, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.subarray(0, this.vertexIndex), gl.DYNAMIC_DRAW)

        const stride = 5 * 4  // 5 floats * 4 bytes

        gl.enableVertexAttribArray(program.attributes.aPosition)
        gl.vertexAttribPointer(program.attributes.aPosition, 2, gl.FLOAT, false, stride, 0)

        gl.enableVertexAttribArray(program.attributes.aTexCoord)
        gl.vertexAttribPointer(program.attributes.aTexCoord, 2, gl.FLOAT, false, stride, 2 * 4)

        gl.enableVertexAttribArray(program.attributes.aOpacity)
        gl.vertexAttribPointer(program.attributes.aOpacity, 1, gl.FLOAT, false, stride, 4 * 4)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
        gl.drawElements(gl.TRIANGLES, this.spriteCount * 6, gl.UNSIGNED_SHORT, 0)

        this.spriteCount = 0
        this.vertexIndex = 0
    }


    end () {
        this.flush()
    }


    dispose () {
        const gl = this.gl
        gl.deleteBuffer(this.vertexBuffer)
        gl.deleteBuffer(this.indexBuffer)
    }

}
