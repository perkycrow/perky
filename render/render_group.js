import PerkyModule from '../core/perky_module.js'


export const BLEND_MODES = {
    normal: 'normal',
    additive: 'additive',
    multiply: 'multiply'
}

export default class RenderGroup extends PerkyModule {

    static $category = 'renderGroup'
    static $name = 'renderGroup'

    constructor (options = {}) { // eslint-disable-line complexity
        super(options)

        this.content = options.content ?? null
        this.postPasses = options.postPasses ?? []
        this.blendMode = options.blendMode ?? BLEND_MODES.normal
        this.visible = options.visible ?? true
        this.opacity = options.opacity ?? 1
        this.renderTransform = options.renderTransform ?? null

        this.#initialized = false
    }

    #initialized = false

    onInstall () {
        const renderer = this.host
        if (!renderer?.gl || !renderer?.shaderRegistry) {
            return
        }

        this.#initPasses(renderer.shaderRegistry)
        this.#initTransform(renderer)

        const fbManager = renderer.postProcessor?.framebufferManager
        if (fbManager) {
            fbManager.getOrCreateBuffer(this.$name)
        }
    }


    #initTransform (renderer) {
        if (this.renderTransform) {
            this.renderTransform.init({
                gl: renderer.gl,
                shaderRegistry: renderer.shaderRegistry
            })
        }
    }


    #initPasses (shaderRegistry) {
        if (this.#initialized) {
            return
        }

        for (const pass of this.postPasses) {
            pass.init(shaderRegistry)
        }

        this.#initialized = true
    }


    hasActivePasses () {
        return this.postPasses.some(pass => pass.enabled)
    }


    onDispose () {
        const fbManager = this.host?.postProcessor?.framebufferManager
        if (fbManager) {
            fbManager.disposeBuffer(this.$name)
        }

        for (const pass of this.postPasses) {
            pass.dispose()
        }
        this.postPasses = []

        if (this.renderTransform) {
            this.renderTransform.dispose()
            this.renderTransform = null
        }

        this.#initialized = false
    }


    addPostPass (pass) {
        if (this.#initialized && this.host?.shaderRegistry) {
            pass.init(this.host.shaderRegistry)
        }
        this.postPasses.push(pass)
        this.emit('postPass:added', pass)
        return this
    }


    removePostPass (pass) {
        const index = this.postPasses.indexOf(pass)
        if (index !== -1) {
            this.postPasses.splice(index, 1)
            pass.dispose()
            this.emit('postPass:removed', pass)
        }
        return this
    }

}
