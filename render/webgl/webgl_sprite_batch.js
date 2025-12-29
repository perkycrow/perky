import Image2D from '../image_2d'
import Sprite2D from '../sprite_2d'


export default class WebGLSpriteBatch {

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


    addSprite (object, effectiveOpacity, hints = null) { // eslint-disable-line complexity
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

        const bounds = object.getBounds()
        const {minX, minY, maxX, maxY} = bounds

        const m = object.worldMatrix

        const corners = [
            {x: minX, y: minY},  // bottom-left
            {x: maxX, y: minY},  // bottom-right
            {x: maxX, y: maxY},  // top-right
            {x: minX, y: maxY}   // top-left
        ]

        const transformedCorners = corners.map(corner => ({
            x: m[0] * corner.x + m[2] * corner.y + m[4],
            y: m[1] * corner.x + m[3] * corner.y + m[5]
        }))


        let texCoords
        if (frame) {
            const {x, y, w, h} = frame.frame
            const iw = image.width
            const ih = image.height

            texCoords = [
                {u: x / iw, v: (y + h) / ih},           // bottom-left
                {u: (x + w) / iw, v: (y + h) / ih},     // bottom-right
                {u: (x + w) / iw, v: y / ih},           // top-right
                {u: x / iw, v: y / ih}                  // top-left
            ]
        } else {
            texCoords = [
                {u: 0, v: 1},  // bottom-left
                {u: 1, v: 1},  // bottom-right
                {u: 1, v: 0},  // top-right
                {u: 0, v: 0}   // top-left
            ]
        }

        for (let i = 0; i < 4; i++) {
            const idx = this.vertexIndex

            this.vertexData[idx + 0] = transformedCorners[i].x
            this.vertexData[idx + 1] = transformedCorners[i].y
            this.vertexData[idx + 2] = texCoords[i].u
            this.vertexData[idx + 3] = texCoords[i].v
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
        gl.uniform1i(program.uniforms.texture, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.subarray(0, this.vertexIndex), gl.DYNAMIC_DRAW)

        const stride = 5 * 4  // 5 floats * 4 bytes

        gl.enableVertexAttribArray(program.attributes.position)
        gl.vertexAttribPointer(program.attributes.position, 2, gl.FLOAT, false, stride, 0)

        gl.enableVertexAttribArray(program.attributes.texCoord)
        gl.vertexAttribPointer(program.attributes.texCoord, 2, gl.FLOAT, false, stride, 2 * 4)

        gl.enableVertexAttribArray(program.attributes.opacity)
        gl.vertexAttribPointer(program.attributes.opacity, 1, gl.FLOAT, false, stride, 4 * 4)

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
