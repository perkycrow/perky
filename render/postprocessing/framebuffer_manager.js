export default class FramebufferManager {

    #gl = null
    #width = 0
    #height = 0
    #samples = 4

    // MSAA scene buffer (renderbuffer, not texture)
    #msaaFramebuffer = null
    #msaaRenderbuffer = null

    // Resolve target (texture we can sample from)
    #sceneFramebuffer = null
    #sceneTexture = null

    #pingPongFramebuffers = []
    #pingPongTextures = []
    #currentPingPong = 0


    constructor (gl, width, height, samples = 4) {
        this.#gl = gl
        this.#width = width
        this.#height = height
        this.#samples = Math.min(samples, gl.getParameter(gl.MAX_SAMPLES))
        this.#createFramebuffers()
    }


    get width () {
        return this.#width
    }


    get height () {
        return this.#height
    }


    get samples () {
        return this.#samples
    }


    #createFramebuffers () {
        this.#createMSAAFramebuffer()
        this.#createResolveFramebuffer()

        for (let i = 0; i < 2; i++) {
            const {framebuffer, texture} = this.#createFramebuffer()
            this.#pingPongFramebuffers.push(framebuffer)
            this.#pingPongTextures.push(texture)
        }
    }


    #createMSAAFramebuffer () {
        const gl = this.#gl
        const width = Math.max(1, this.#width)
        const height = Math.max(1, this.#height)

        this.#msaaRenderbuffer = gl.createRenderbuffer()
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.#msaaRenderbuffer)
        gl.renderbufferStorageMultisample(
            gl.RENDERBUFFER,
            this.#samples,
            gl.RGBA8,
            width,
            height
        )

        this.#msaaFramebuffer = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#msaaFramebuffer)
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.RENDERBUFFER,
            this.#msaaRenderbuffer
        )

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('MSAA Framebuffer not complete:', status)
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    }


    #createResolveFramebuffer () {
        const {framebuffer, texture} = this.#createFramebuffer()
        this.#sceneFramebuffer = framebuffer
        this.#sceneTexture = texture
    }


    #createFramebuffer () {
        const gl = this.#gl

        const width = Math.max(1, this.#width)
        const height = Math.max(1, this.#height)

        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA8,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        )
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        const framebuffer = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texture,
            0
        )

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('Framebuffer not complete:', status)
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.bindTexture(gl.TEXTURE_2D, null)

        return {framebuffer, texture}
    }


    resize (width, height) {
        if (width === this.#width && height === this.#height) {
            return
        }

        this.#width = width
        this.#height = height

        this.#deleteFramebuffers()
        this.#createFramebuffers()
    }


    #deleteFramebuffers () {
        const gl = this.#gl

        if (this.#msaaFramebuffer) {
            gl.deleteFramebuffer(this.#msaaFramebuffer)
            gl.deleteRenderbuffer(this.#msaaRenderbuffer)
        }

        if (this.#sceneFramebuffer) {
            gl.deleteFramebuffer(this.#sceneFramebuffer)
            gl.deleteTexture(this.#sceneTexture)
        }

        for (let i = 0; i < this.#pingPongFramebuffers.length; i++) {
            gl.deleteFramebuffer(this.#pingPongFramebuffers[i])
            gl.deleteTexture(this.#pingPongTextures[i])
        }

        this.#pingPongFramebuffers = []
        this.#pingPongTextures = []
    }


    resetPingPong () {
        this.#currentPingPong = 0
    }


    bindSceneBuffer () {
        const gl = this.#gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#msaaFramebuffer)
        gl.viewport(0, 0, this.#width, this.#height)
    }


    resolveSceneBuffer () {
        const gl = this.#gl
        const width = this.#width
        const height = this.#height

        // Blit from MSAA renderbuffer to resolve texture
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.#msaaFramebuffer)
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.#sceneFramebuffer)
        gl.blitFramebuffer(
            0, 0, width, height,
            0, 0, width, height,
            gl.COLOR_BUFFER_BIT,
            gl.NEAREST
        )
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null)
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
    }


    getSceneTexture () {
        return this.#sceneTexture
    }


    bindPingPong () {
        const gl = this.#gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#pingPongFramebuffers[this.#currentPingPong])
        gl.viewport(0, 0, this.#width, this.#height)
    }


    swapAndGetTexture () {
        const texture = this.#pingPongTextures[this.#currentPingPong]
        this.#currentPingPong = 1 - this.#currentPingPong
        return texture
    }


    bindScreen () {
        const gl = this.#gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, this.#width, this.#height)
    }


    dispose () {
        this.#deleteFramebuffers()
        this.#msaaFramebuffer = null
        this.#msaaRenderbuffer = null
        this.#sceneFramebuffer = null
        this.#sceneTexture = null
        this.#gl = null
    }

}
