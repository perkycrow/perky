export default class GBuffer {

    #gl = null
    #width = 0
    #height = 0
    #framebuffer = null
    #albedoTexture = null
    #normalTexture = null
    #materialTexture = null
    #depthTexture = null

    constructor ({gl, width, height}) {
        this.#gl = gl
        this.#width = width
        this.#height = height
        this.#createResources()
    }


    get width () {
        return this.#width
    }


    get height () {
        return this.#height
    }


    get albedoTexture () {
        return this.#albedoTexture
    }


    get normalTexture () {
        return this.#normalTexture
    }


    get materialTexture () {
        return this.#materialTexture
    }


    get depthTexture () {
        return this.#depthTexture
    }


    resize (width, height) {
        if (width === this.#width && height === this.#height) {
            return
        }
        this.#deleteResources()
        this.#width = width
        this.#height = height
        this.#createResources()
    }


    begin () {
        const gl = this.#gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#framebuffer)
        gl.drawBuffers([
            gl.COLOR_ATTACHMENT0,
            gl.COLOR_ATTACHMENT1,
            gl.COLOR_ATTACHMENT2
        ])
        gl.viewport(0, 0, this.#width, this.#height)
        gl.clearColor(0.0, 0.0, 0.0, 0.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }


    end () {
        const gl = this.#gl
        gl.drawBuffers([gl.COLOR_ATTACHMENT0])
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }


    blitDepthTo (targetFramebuffer) {
        const gl = this.#gl
        const w = this.#width
        const h = this.#height
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.#framebuffer)
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, targetFramebuffer)
        gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.DEPTH_BUFFER_BIT, gl.NEAREST)
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null)
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
    }


    dispose () {
        this.#deleteResources()
        this.#gl = null
    }


    #createResources () {
        const gl = this.#gl
        const w = this.#width
        const h = this.#height

        this.#albedoTexture = createColorTexture(gl, w, h)
        this.#normalTexture = createColorTexture(gl, w, h)
        this.#materialTexture = createColorTexture(gl, w, h)
        this.#depthTexture = createDepthTexture(gl, w, h)

        this.#framebuffer = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#albedoTexture, 0)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.#normalTexture, 0)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, this.#materialTexture, 0)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.#depthTexture, 0)
        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2])

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error(`GBuffer framebuffer not complete: ${status}`)
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }


    #deleteResources () {
        const gl = this.#gl
        if (!gl) {
            return
        }
        if (this.#framebuffer) {
            gl.deleteFramebuffer(this.#framebuffer)
            this.#framebuffer = null
        }
        if (this.#albedoTexture) {
            gl.deleteTexture(this.#albedoTexture)
            this.#albedoTexture = null
        }
        if (this.#normalTexture) {
            gl.deleteTexture(this.#normalTexture)
            this.#normalTexture = null
        }
        if (this.#materialTexture) {
            gl.deleteTexture(this.#materialTexture)
            this.#materialTexture = null
        }
        if (this.#depthTexture) {
            gl.deleteTexture(this.#depthTexture)
            this.#depthTexture = null
        }
    }

}


function createColorTexture (gl, width, height) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
}


function createDepthTexture (gl, width, height) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
}
