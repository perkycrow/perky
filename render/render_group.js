import PerkyModule from '../core/perky_module'


/**
 * Blend modes for RenderGroup composition.
 * Determines how a group is blended onto previous groups.
 */
export const BLEND_MODES = {
    normal: 'normal',
    additive: 'additive',
    multiply: 'multiply'
}


/**
 * RenderGroup defines a scene graph node that can be rendered
 * with its own post-processing passes and composition settings.
 *
 * As a PerkyModule, it integrates with the engine lifecycle and
 * appears in the editor's PerkyExplorer.
 *
 * @example
 * // Create via WebGLCanvas2D.create()
 * const shadowsGroup = renderer.create(RenderGroup, {
 *     $name: 'shadows',
 *     content: shadowsNode
 * })
 *
 * @example
 * // With per-group post-processing
 * const entitiesGroup = renderer.create(RenderGroup, {
 *     $name: 'entities',
 *     content: entitiesNode,
 *     postPasses: [new ColorGradePass()]
 * })
 *
 * @example
 * // Additive blend for glow effects
 * const particlesGroup = renderer.create(RenderGroup, {
 *     $name: 'particles',
 *     content: particlesNode,
 *     blendMode: 'additive'
 * })
 */
export default class RenderGroup extends PerkyModule {

    static $category = 'renderGroup'
    static $name = 'renderGroup'


    /**
     * @param {Object} options
     * @param {Object2D} [options.content=null] - Scene graph node to render
     * @param {RenderPass[]} [options.postPasses=[]] - Post-processing passes for this group only
     * @param {string} [options.blendMode='normal'] - How to composite this group
     * @param {boolean} [options.visible=true] - Whether to render this group
     * @param {number} [options.opacity=1] - Opacity when compositing
     */
    constructor (options = {}) {
        super(options)

        this.content = options.content ?? null
        this.postPasses = options.postPasses ?? []
        this.blendMode = options.blendMode ?? BLEND_MODES.normal
        this.visible = options.visible ?? true
        this.opacity = options.opacity ?? 1

        this.#initialized = false
    }


    #initialized = false


    /**
     * Initialize post-passes with WebGL context.
     * Called automatically when installed on WebGLCanvas2D.
     */
    onInstall () {
        const renderer = this.host
        if (!renderer?.gl || !renderer?.shaderRegistry) {
            return
        }

        this.#initPasses(renderer.gl, renderer.shaderRegistry)

        const fbManager = renderer.postProcessor?.framebufferManager
        if (fbManager) {
            fbManager.getOrCreateBuffer(this.$name)
        }
    }


    #initPasses (gl, shaderRegistry) {
        if (this.#initialized) {
            return
        }

        for (const pass of this.postPasses) {
            pass.init(gl, shaderRegistry)
        }

        this.#initialized = true
    }


    /**
     * Check if this group has any active post-passes.
     * @returns {boolean}
     */
    hasActivePasses () {
        return this.postPasses.some(pass => pass.enabled)
    }


    /**
     * Dispose of post-passes.
     */
    onDispose () {
        for (const pass of this.postPasses) {
            pass.dispose()
        }
        this.postPasses = []
        this.#initialized = false
    }


    /**
     * Add a post-processing pass to this group.
     * @param {RenderPass} pass
     * @returns {this}
     */
    addPostPass (pass) {
        if (this.#initialized && this.host?.gl) {
            pass.init(this.host.gl, this.host.shaderRegistry)
        }
        this.postPasses.push(pass)
        this.emit('postPass:added', pass)
        return this
    }


    /**
     * Remove a post-processing pass from this group.
     * @param {RenderPass} pass
     * @returns {this}
     */
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
