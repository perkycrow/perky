export default class FramebufferManager {

    #gl = null
    #width = 0
    #height = 0
    #samples = 4

    #msaaFramebuffer = null
    #msaaRenderbuffer = null
    #sceneFramebuffer = null
    #sceneTexture = null
    #pingPongFramebuffers = []
    #pingPongTextures = []
    #currentPingPong = 0
    #namedBuffers = new Map()


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
        this.#resizeNamedBuffers()
    }


    #resizeNamedBuffers () {
        const gl = this.#gl
        const names = [...this.#namedBuffers.keys()]

        for (const name of names) {
            const old = this.#namedBuffers.get(name)
            gl.deleteFramebuffer(old.framebuffer)
            gl.deleteTexture(old.texture)

            const {framebuffer, texture} = this.#createFramebuffer()
            this.#namedBuffers.set(name, {framebuffer, texture})
        }
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


    /**
     * Resolve MSAA buffer content to a named buffer.
     * This enables MSAA antialiasing for render groups by:
     * 1. Rendering group content to shared MSAA buffer
     * 2. Resolving to the group's named texture buffer
     *
     * @param {string} name - Named buffer to resolve to
     * @returns {boolean} True if successful
     */
    resolveToBuffer (name) {
        const buffer = this.#namedBuffers.get(name)
        if (!buffer) {
            return false
        }

        const gl = this.#gl
        const width = this.#width
        const height = this.#height

        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.#msaaFramebuffer)
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, buffer.framebuffer)
        gl.blitFramebuffer(
            0, 0, width, height,
            0, 0, width, height,
            gl.COLOR_BUFFER_BIT,
            gl.NEAREST
        )
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null)
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)

        return true
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


    /**
     * Get or create a named framebuffer for RenderGroup.
     * Creates the buffer on first access, reuses on subsequent calls.
     *
     * @param {string} name - Unique identifier for the buffer
     * @returns {{framebuffer: WebGLFramebuffer, texture: WebGLTexture}}
     */
    getOrCreateBuffer (name) {
        if (!this.#namedBuffers.has(name)) {
            const {framebuffer, texture} = this.#createFramebuffer()
            this.#namedBuffers.set(name, {framebuffer, texture})
        }
        return this.#namedBuffers.get(name)
    }


    /**
     * Bind a named framebuffer for rendering.
     *
     * @param {string} name - Buffer identifier
     * @returns {boolean} True if buffer was bound
     */
    bindBuffer (name) {
        const buffer = this.#namedBuffers.get(name)
        if (!buffer) {
            return false
        }
        const gl = this.#gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer.framebuffer)
        gl.viewport(0, 0, this.#width, this.#height)
        return true
    }


    /**
     * Get texture from a named buffer.
     *
     * @param {string} name - Buffer identifier
     * @returns {WebGLTexture|null}
     */
    getBufferTexture (name) {
        return this.#namedBuffers.get(name)?.texture ?? null
    }


    /**
     * Dispose all named buffers.
     */
    disposeNamedBuffers () {
        const gl = this.#gl
        for (const {framebuffer, texture} of this.#namedBuffers.values()) {
            gl.deleteFramebuffer(framebuffer)
            gl.deleteTexture(texture)
        }
        this.#namedBuffers.clear()
    }


    bindScreen () {
        const gl = this.#gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, this.#width, this.#height)
    }


    dispose () {
        this.#deleteFramebuffers()
        this.disposeNamedBuffers()
        this.#msaaFramebuffer = null
        this.#msaaRenderbuffer = null
        this.#sceneFramebuffer = null
        this.#sceneTexture = null
        this.#gl = null
    }

}
