export default class WebGLTextureManager {

    constructor (gl) {
        this.gl = gl
        this.textures = new Map()
    }


    getTexture (image) {
        if (!image) {
            return null
        }

        if (!this.textures.has(image)) {
            this.createTexture(image)
        }

        return this.textures.get(image)
    }


    createTexture (image) {
        const gl = this.gl
        const texture = gl.createTexture()

        gl.bindTexture(gl.TEXTURE_2D, texture)

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        )

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        gl.bindTexture(gl.TEXTURE_2D, null)

        this.textures.set(image, texture)
    }


    deleteTexture (image) {
        const texture = this.textures.get(image)
        if (texture) {
            this.gl.deleteTexture(texture)
            this.textures.delete(image)
        }
    }


    dispose () {
        this.textures.forEach(texture => {
            this.gl.deleteTexture(texture)
        })
        this.textures.clear()
    }

}
