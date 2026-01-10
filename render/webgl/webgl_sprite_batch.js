const DEFAULT_TEX_COORDS = [0, 1, 1, 1, 1, 0, 0, 0]
const DEFAULT_TINT = [0, 0, 0, 0]
const DEFAULT_EFFECT_PARAMS = [0, 0, 0, 0]
const FLOATS_PER_VERTEX = 14


function computeTexCoords (region, texCoords) {
    if (region) {
        const {u0, v0, u1, v1} = region.uvs

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
}


function getValidTexture (image, textureManager) {
    if (!image || !image.complete || image.naturalWidth === 0) {
        return null
    }
    return textureManager.getTexture(image)
}


function transformCorners (m, bounds, corners) {
    const {minX, minY, maxX, maxY} = bounds
    corners[0] = m[0] * minX + m[2] * minY + m[4]
    corners[1] = m[1] * minX + m[3] * minY + m[5]
    corners[2] = m[0] * maxX + m[2] * minY + m[4]
    corners[3] = m[1] * maxX + m[3] * minY + m[5]
    corners[4] = m[0] * maxX + m[2] * maxY + m[4]
    corners[5] = m[1] * maxX + m[3] * maxY + m[5]
    corners[6] = m[0] * minX + m[2] * maxY + m[4]
    corners[7] = m[1] * minX + m[3] * maxY + m[5]
}


export default class WebGLSpriteBatch {

    #tempCorners = new Float32Array(8)
    #tempTexCoords = new Float32Array(8)

    constructor (gl, spriteProgram, textureManager, options = {}) {
        this.gl = gl
        this.spriteProgram = spriteProgram
        this.textureManager = textureManager

        this.maxSprites = options.maxSprites ?? 1000


        this.vertexData = new Float32Array(this.maxSprites * 4 * FLOATS_PER_VERTEX)
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
        this.currentTextureSize = {width: 1, height: 1}
        this.spriteCount = 0
        this.vertexIndex = 0
        this.activeProgram = null
    }


    begin (program = null) {
        this.spriteCount = 0
        this.vertexIndex = 0
        this.currentTexture = null
        this.activeProgram = program
    }


    #ensureTexture (texture) {
        if (this.currentTexture !== texture) {
            this.flush()
            this.currentTexture = texture
        }

        if (this.spriteCount >= this.maxSprites) {
            this.flush()
        }
    }


    #writeVertices (sprite) {
        const {corners, texCoords, opacity, hints, anchorY} = sprite
        const t = hints?.tint || DEFAULT_TINT
        const ep = hints?.effectParams || DEFAULT_EFFECT_PARAMS

        for (let i = 0; i < 4; i++) {
            const idx = this.vertexIndex
            const ci = i * 2

            this.vertexData[idx] = corners[ci]
            this.vertexData[idx + 1] = corners[ci + 1]
            this.vertexData[idx + 2] = texCoords[ci]
            this.vertexData[idx + 3] = texCoords[ci + 1]
            this.vertexData[idx + 4] = opacity
            this.vertexData[idx + 5] = anchorY
            this.vertexData[idx + 6] = t[0]
            this.vertexData[idx + 7] = t[1]
            this.vertexData[idx + 8] = t[2]
            this.vertexData[idx + 9] = t[3]
            this.vertexData[idx + 10] = ep[0]
            this.vertexData[idx + 11] = ep[1]
            this.vertexData[idx + 12] = ep[2]
            this.vertexData[idx + 13] = ep[3]

            this.vertexIndex += FLOATS_PER_VERTEX
        }

        this.spriteCount++
    }


    addSprite (object, effectiveOpacity, hints = null) {
        const region = object.region
        const image = region?.image
        const texture = getValidTexture(image, this.textureManager)

        if (!texture) {
            return
        }

        this.#ensureTexture(texture)

        if (image) {
            this.currentTextureSize.width = image.width || 1
            this.currentTextureSize.height = image.height || 1
        }

        const corners = this.#tempCorners
        const texCoords = this.#tempTexCoords
        const bounds = object.getBounds()

        transformCorners(object.worldMatrix, bounds, corners)
        computeTexCoords(region, texCoords)

        const localAnchorX = bounds.minX + object.anchorX * bounds.width
        const localAnchorY = bounds.minY + object.anchorY * bounds.height
        const m = object.worldMatrix
        const worldAnchorY = m[1] * localAnchorX + m[3] * localAnchorY + m[5]

        this.#writeVertices({
            corners,
            texCoords,
            opacity: effectiveOpacity,
            hints,
            anchorY: worldAnchorY
        })
    }


    flush (alternateProgram = null) {
        if (this.spriteCount === 0) {
            return
        }

        const gl = this.gl
        const program = alternateProgram || this.activeProgram || this.spriteProgram

        gl.useProgram(program.program)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.currentTexture)
        gl.uniform1i(program.uniforms.uTexture, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.subarray(0, this.vertexIndex), gl.DYNAMIC_DRAW)

        const stride = FLOATS_PER_VERTEX * 4

        gl.enableVertexAttribArray(program.attributes.aPosition)
        gl.vertexAttribPointer(program.attributes.aPosition, 2, gl.FLOAT, false, stride, 0)

        gl.enableVertexAttribArray(program.attributes.aTexCoord)
        gl.vertexAttribPointer(program.attributes.aTexCoord, 2, gl.FLOAT, false, stride, 2 * 4)

        gl.enableVertexAttribArray(program.attributes.aOpacity)
        gl.vertexAttribPointer(program.attributes.aOpacity, 1, gl.FLOAT, false, stride, 4 * 4)

        this.#bindOptionalAttributes(program, stride)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
        gl.drawElements(gl.TRIANGLES, this.spriteCount * 6, gl.UNSIGNED_SHORT, 0)

        this.spriteCount = 0
        this.vertexIndex = 0
    }


    #bindOptionalAttributes (program, stride) {
        const gl = this.gl
        const attrs = program.attributes

        const optionalAttrs = [
            {name: 'aAnchorY', size: 1, offset: 5 * 4},
            {name: 'aTintColor', size: 4, offset: 6 * 4},
            {name: 'aEffectParams', size: 4, offset: 10 * 4}
        ]

        for (const {name, size, offset} of optionalAttrs) {
            const location = attrs[name]
            if (location !== undefined && location !== -1) {
                gl.enableVertexAttribArray(location)
                gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset)
            }
        }
    }


    end (alternateProgram = null) {
        this.flush(alternateProgram)
    }


    dispose () {
        const gl = this.gl
        gl.deleteBuffer(this.vertexBuffer)
        gl.deleteBuffer(this.indexBuffer)
    }

}
