import FramebufferManager from './framebuffer_manager'
import FullscreenQuad from './fullscreen_quad'


export default class PostProcessor {

    #gl = null
    #shaderRegistry = null
    #framebufferManager = null
    #fullscreenQuad = null
    #passes = []
    #enabled = true


    constructor (gl, shaderRegistry, width, height) {
        this.#gl = gl
        this.#shaderRegistry = shaderRegistry
        this.#framebufferManager = new FramebufferManager(gl, width, height)
        this.#fullscreenQuad = new FullscreenQuad(gl)
    }


    get enabled () {
        return this.#enabled
    }


    set enabled (value) {
        this.#enabled = value
    }


    get passes () {
        return this.#passes
    }


    addPass (pass) {
        pass.init(this.#gl, this.#shaderRegistry)
        this.#passes.push(pass)
        return this
    }


    removePass (pass) {
        const index = this.#passes.indexOf(pass)
        if (index !== -1) {
            this.#passes.splice(index, 1)
            pass.dispose()
        }
        return this
    }


    clearPasses () {
        for (const pass of this.#passes) {
            pass.dispose()
        }
        this.#passes = []
        return this
    }


    resize (width, height) {
        this.#framebufferManager.resize(width, height)
    }


    hasActivePasses () {
        return this.#enabled && this.#passes.some(pass => pass.enabled)
    }


    begin () {
        if (!this.hasActivePasses()) {
            return false
        }

        // Reset ping-pong state for clean frame
        this.#framebufferManager.resetPingPong()
        this.#framebufferManager.bindSceneBuffer()

        // Don't change blend func - let renderer use its normal blending

        return true
    }


    finish () {
        if (!this.hasActivePasses()) {
            return
        }

        const gl = this.#gl
        const activePasses = this.#passes.filter(pass => pass.enabled)

        // Resolve MSAA to texture
        this.#framebufferManager.resolveSceneBuffer()

        // Disable blending for post-processing passes
        gl.disable(gl.BLEND)

        let inputTexture = this.#framebufferManager.getSceneTexture()

        for (let i = 0; i < activePasses.length; i++) {
            const isLast = i === activePasses.length - 1

            if (isLast) {
                this.#framebufferManager.bindScreen()
                // Clear screen to ensure no old content remains
                gl.clearColor(0, 0, 0, 1)
                gl.clear(gl.COLOR_BUFFER_BIT)
            } else {
                this.#framebufferManager.bindPingPong()
                gl.clearColor(0, 0, 0, 0)
                gl.clear(gl.COLOR_BUFFER_BIT)
            }

            activePasses[i].render(gl, inputTexture, this.#fullscreenQuad)

            if (!isLast) {
                inputTexture = this.#framebufferManager.swapAndGetTexture()
            }
        }

        // Re-enable blending with standard blend func for normal rendering
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    }


    dispose () {
        this.clearPasses()

        if (this.#framebufferManager) {
            this.#framebufferManager.dispose()
            this.#framebufferManager = null
        }

        if (this.#fullscreenQuad) {
            this.#fullscreenQuad.dispose(this.#gl)
            this.#fullscreenQuad = null
        }

        this.#gl = null
        this.#shaderRegistry = null
    }

}
