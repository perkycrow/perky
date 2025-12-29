import BaseRenderer from './base_renderer'
import {traverseAndCollect} from './traverse'
import ShaderRegistry from './shaders/shader_registry'
import {SPRITE_SHADER_DEF} from './shaders/builtin/sprite_shader'
import {PRIMITIVE_SHADER_DEF} from './shaders/builtin/primitive_shader'
import PostProcessor from './postprocessing/post_processor'
import WebGLTextureManager from './webgl_texture_manager'
import {parseColor} from './webgl/color_utils'
import RenderGroup, {BLEND_MODES} from './render_group'
import FullscreenQuad from './postprocessing/fullscreen_quad'

import WebGLSpriteRenderer from './webgl/webgl_sprite_renderer'
import WebGLCircleRenderer from './webgl/webgl_circle_renderer'
import WebGLRectangleRenderer from './webgl/webgl_rectangle_renderer'


export default class WebGLCanvas2D extends BaseRenderer {

    static $name = 'webGLCanvas2D'

    #rendererRegistry = new Map()
    #renderers = []
    #shaderRegistry = null
    #postProcessor = null

    // RenderGroup support (composite rendering)
    #compositeQuad = null
    #compositeProgram = null



    constructor (options = {}) { // eslint-disable-line complexity
        super(options)

        this.#setupWebGL()
        this.#setupDefaultRenderers()
        this.applyPixelRatio()

        this.backgroundColor = options.backgroundColor ?? null
        this.enableCulling = options.enableCulling ?? false

        this.stats = {
            totalObjects: 0,
            renderedObjects: 0,
            culledObjects: 0,
            drawCalls: 0
        }
    }


    #setupWebGL () {
        this.gl = this.canvas.getContext('webgl2', {
            alpha: true,
            premultipliedAlpha: false,
            antialias: true,
            preserveDrawingBuffer: false
        })

        if (!this.gl) {
            throw new Error('WebGL2 not supported')
        }

        const gl = this.gl

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        this.#shaderRegistry = new ShaderRegistry(gl)
        this.#setupBuiltinShaders()

        this.create(WebGLTextureManager, {
            $bind: 'textureManager',
            gl
        })

        this.#postProcessor = new PostProcessor(
            gl,
            this.#shaderRegistry,
            this.canvas.width,
            this.canvas.height
        )
    }


    #setupBuiltinShaders () {
        this.spriteProgram = this.#shaderRegistry.register('sprite', SPRITE_SHADER_DEF)
        this.primitiveProgram = this.#shaderRegistry.register('primitive', PRIMITIVE_SHADER_DEF)

        this.#shaderRegistry.setDefault('sprite', 'sprite')
        this.#shaderRegistry.setDefault('primitive', 'primitive')
    }


    #setupDefaultRenderers () {
        this.registerRenderer(new WebGLSpriteRenderer())
        this.registerRenderer(new WebGLCircleRenderer())
        this.registerRenderer(new WebGLRectangleRenderer())
    }


    registerRenderer (renderer) {
        const context = {
            gl: this.gl,
            spriteProgram: this.spriteProgram,
            primitiveProgram: this.primitiveProgram,
            textureManager: this.textureManager
        }

        renderer.init(context)

        for (const ObjectClass of renderer.constructor.handles) {
            this.#rendererRegistry.set(ObjectClass, renderer)
        }

        if (!this.#renderers.includes(renderer)) {
            this.#renderers.push(renderer)
        }

        return this
    }


    unregisterRenderer (renderer) {
        for (const ObjectClass of renderer.constructor.handles) {
            if (this.#rendererRegistry.get(ObjectClass) === renderer) {
                this.#rendererRegistry.delete(ObjectClass)
            }
        }

        const index = this.#renderers.indexOf(renderer)
        if (index !== -1) {
            this.#renderers.splice(index, 1)
        }

        renderer.dispose()
        return this
    }


    applyPixelRatio () {
        super.applyPixelRatio()

        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
        }

        if (this.#postProcessor) {
            this.#postProcessor.resize(this.canvas.width, this.canvas.height)
        }
    }


    get shaderRegistry () {
        return this.#shaderRegistry
    }


    registerShader (id, definition) {
        return this.#shaderRegistry.register(id, definition)
    }


    getShader (id) {
        return this.#shaderRegistry.get(id)
    }


    get postProcessor () {
        return this.#postProcessor
    }


    addPostPass (pass) {
        this.#postProcessor.addPass(pass)
        return this
    }


    removePostPass (pass) {
        this.#postProcessor.removePass(pass)
        return this
    }


    /**
     * Set render groups for multi-layer rendering.
     * Each group is rendered to its own framebuffer, processed with its own
     * post-passes, then all groups are composited together before global post-processing.
     *
     * @param {Object[]} configs - Array of RenderGroup config objects in render order (back to front)
     * @returns {this}
     *
     * @example
     * renderer.setRenderGroups([
     *     {$name: 'background', content: bgGroup},
     *     {$name: 'shadows', content: shadowGroup},
     *     {$name: 'entities', content: entityGroup, postPasses: [colorGrade]}
     * ])
     */
    setRenderGroups (configs) {
        this.clearRenderGroups()

        // Initialize composite shader if needed
        if (!this.#compositeProgram) {
            this.#setupCompositeShader()
        }
        if (!this.#compositeQuad) {
            this.#compositeQuad = new FullscreenQuad(this.gl)
        }

        // Create each group via PerkyModule create()
        for (const config of configs) {
            this.create(RenderGroup, config)
        }

        return this
    }


    /**
     * Clear all render groups, reverting to single-scene rendering.
     */
    clearRenderGroups () {
        const groups = this.renderGroups
        for (const group of groups) {
            this.removeChild(group.$id)
        }
        return this
    }


    /**
     * Get the current render groups in registration order.
     * @returns {RenderGroup[]}
     */
    get renderGroups () {
        return this.childrenByCategory('renderGroup')
    }


    #setupCompositeShader () {
        const COMPOSITE_SHADER_DEF = {
            vertex: `#version 300 es
                in vec2 aPosition;
                in vec2 aTexCoord;
                out vec2 vTexCoord;
                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);
                    vTexCoord = aTexCoord;
                }
            `,
            fragment: `#version 300 es
                precision mediump float;
                uniform sampler2D uTexture;
                uniform float uOpacity;
                in vec2 vTexCoord;
                out vec4 fragColor;
                void main() {
                    vec4 color = texture(uTexture, vTexCoord);
                    // Use premultiplied alpha for correct compositing
                    float alpha = color.a * uOpacity;
                    fragColor = vec4(color.rgb * uOpacity, alpha);
                }
            `,
            uniforms: ['uTexture', 'uOpacity'],
            attributes: ['aPosition', 'aTexCoord']
        }

        this.#compositeProgram = this.#shaderRegistry.register('_composite', COMPOSITE_SHADER_DEF)
    }


    onDispose () {
        for (const renderer of this.#renderers) {
            renderer.dispose()
        }
        this.#renderers = []
        this.#rendererRegistry.clear()

        // Clean up render groups
        this.clearRenderGroups()

        if (this.#compositeQuad) {
            this.#compositeQuad.dispose(this.gl)
            this.#compositeQuad = null
        }

        if (this.#postProcessor) {
            this.#postProcessor.dispose()
            this.#postProcessor = null
        }

        if (this.#shaderRegistry) {
            this.#shaderRegistry.dispose()
            this.#shaderRegistry = null
        }

        super.onDispose()
        this.gl = null
    }


    #getMatrices () {
        const w = this.canvas.width
        const h = this.canvas.height
        const ppu = this.camera.pixelsPerUnit * this.pixelRatio

        const projectionMatrix = [
            2 / w, 0, 0,
            0, 2 / h, 0,
            -1, -1, 1
        ]

        const viewMatrix = [
            ppu, 0, 0,
            0, ppu, 0,
            w / 2 - this.camera.x * ppu, h / 2 - this.camera.y * ppu, 1
        ]

        return {projectionMatrix, viewMatrix}
    }


    /**
     * Render the scene or render groups.
     *
     * @param {Object2D} [scene] - Scene to render. If omitted and render groups are set,
     *                             uses multi-group rendering instead.
     */
    render (scene) {
        // If render groups are set and no explicit scene, use multi-group rendering
        if (this.renderGroups.length > 0 && !scene) {
            return this.#renderWithGroups()
        }

        // Legacy single-scene rendering
        return this.#renderSingleScene(scene)
    }


    #renderSingleScene (scene) {
        const gl = this.gl

        this.stats.totalObjects = 0
        this.stats.renderedObjects = 0
        this.stats.culledObjects = 0
        this.stats.drawCalls = 0

        const usePostProcessing = this.#postProcessor.begin()

        if (this.backgroundColor && this.backgroundColor !== 'transparent') {
            const color = parseColor(this.backgroundColor)
            gl.clearColor(color.r, color.g, color.b, color.a)
        } else {
            gl.clearColor(0, 0, 0, 0)
        }
        gl.clear(gl.COLOR_BUFFER_BIT)

        this.camera.update()

        const matrices = this.#getMatrices()

        scene.updateWorldMatrix(false)

        for (const renderer of this.#renderers) {
            renderer.reset()
        }

        traverseAndCollect(scene, this.#rendererRegistry, {
            camera: this.camera,
            enableCulling: this.enableCulling,
            stats: this.stats
        })

        for (const renderer of this.#renderers) {
            renderer.flush(matrices)
        }

        if (usePostProcessing) {
            this.#postProcessor.finish()
        }
    }


    #renderWithGroups () {
        const gl = this.gl
        const fbManager = this.#postProcessor.framebufferManager

        this.stats.totalObjects = 0
        this.stats.renderedObjects = 0
        this.stats.culledObjects = 0
        this.stats.drawCalls = 0

        this.camera.update()
        const matrices = this.#getMatrices()

        // Phase 1: Render each group to MSAA buffer, then resolve to its texture
        for (const group of this.renderGroups) {
            if (!group.visible || !group.content) {
                continue
            }

            // Ensure group's framebuffer exists
            fbManager.getOrCreateBuffer(group.$name)

            // Render to shared MSAA buffer for antialiasing
            fbManager.bindSceneBuffer()

            // Clear with transparent background
            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            // Render group content
            group.content.updateWorldMatrix(false)

            for (const renderer of this.#renderers) {
                renderer.reset()
            }

            traverseAndCollect(group.content, this.#rendererRegistry, {
                camera: this.camera,
                enableCulling: this.enableCulling,
                stats: this.stats
            })

            for (const renderer of this.#renderers) {
                renderer.flush(matrices)
            }

            // Resolve MSAA to group's texture buffer
            fbManager.resolveToBuffer(group.$name)

            // Apply group's local post-passes (if any)
            if (group.hasActivePasses()) {
                this.#applyGroupPasses(group)
            }
        }

        // Phase 2: Composite all groups to the main scene buffer (for global post-processing)
        const hasGlobalPostProcessing = this.#postProcessor.hasActivePasses()

        if (hasGlobalPostProcessing) {
            fbManager.bindSceneBuffer()
        } else {
            fbManager.bindScreen()
        }

        // Clear with background color
        if (this.backgroundColor && this.backgroundColor !== 'transparent') {
            const color = parseColor(this.backgroundColor)
            gl.clearColor(color.r, color.g, color.b, color.a)
        } else {
            gl.clearColor(0, 0, 0, 0)
        }
        gl.clear(gl.COLOR_BUFFER_BIT)

        // Composite each group with its blend mode
        this.#compositeProgram.use()
        gl.activeTexture(gl.TEXTURE0)
        this.#compositeProgram.setUniform1i('uTexture', 0)

        for (const group of this.renderGroups) {
            if (!group.visible || !group.content) {
                continue
            }

            const texture = fbManager.getBufferTexture(group.$name)
            if (!texture) {
                continue
            }

            // Set blend mode
            this.#applyBlendMode(group.blendMode)

            // Set opacity
            this.#compositeProgram.setUniform1f('uOpacity', group.opacity)

            // Draw textured quad
            gl.bindTexture(gl.TEXTURE_2D, texture)
            this.#compositeQuad.draw(gl, this.#compositeProgram)
        }

        // Reset to normal blending
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        // Phase 3: Apply global post-processing
        if (hasGlobalPostProcessing) {
            this.#postProcessor.finish()
        }
    }


    #applyGroupPasses (group) {
        const gl = this.gl
        const fbManager = this.#postProcessor.framebufferManager
        const activePasses = group.postPasses.filter(pass => pass.enabled)

        if (activePasses.length === 0) {
            return
        }

        gl.disable(gl.BLEND)

        // First, copy the group's content to ping-pong buffer to avoid read/write feedback
        fbManager.resetPingPong()
        fbManager.bindPingPong()
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        // Draw the group's texture to ping-pong
        this.#compositeProgram.use()
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, fbManager.getBufferTexture(group.$name))
        this.#compositeProgram.setUniform1i('uTexture', 0)
        this.#compositeProgram.setUniform1f('uOpacity', 1.0)
        this.#compositeQuad.draw(gl, this.#compositeProgram)

        // Now process through passes using ping-pong
        let inputTexture = fbManager.swapAndGetTexture()

        for (let i = 0; i < activePasses.length; i++) {
            const isLast = i === activePasses.length - 1

            if (isLast) {
                // Render back to the group's buffer
                fbManager.bindBuffer(group.$name)
            } else {
                fbManager.bindPingPong()
            }

            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            activePasses[i].render(gl, inputTexture, this.#compositeQuad)

            if (!isLast) {
                inputTexture = fbManager.swapAndGetTexture()
            }
        }

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    }


    #applyBlendMode (blendMode) {
        const gl = this.gl

        // Using premultiplied alpha blend modes
        switch (blendMode) {
        case BLEND_MODES.additive:
            gl.blendFunc(gl.ONE, gl.ONE)
            break
        case BLEND_MODES.multiply:
            gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA)
            break
        case BLEND_MODES.normal:
        default:
                // Premultiplied alpha: ONE, ONE_MINUS_SRC_ALPHA
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
            break
        }
    }

}
