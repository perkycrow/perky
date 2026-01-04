import BaseRenderer from './base_renderer.js'
import {traverseAndCollect} from './traverse.js'
import ShaderRegistry from './shaders/shader_registry.js'
import ShaderEffectRegistry from './shaders/shader_effect_registry.js'
import {SPRITE_SHADER_DEF} from './shaders/builtin/sprite_shader.js'
import {PRIMITIVE_SHADER_DEF} from './shaders/builtin/primitive_shader.js'
import PostProcessor from './postprocessing/post_processor.js'
import WebGLTextureManager from './webgl_texture_manager.js'
import {parseColor} from './webgl/color_utils.js'
import RenderGroup, {BLEND_MODES} from './render_group.js'
import FullscreenQuad from './postprocessing/fullscreen_quad.js'

import WebGLSpriteRenderer from './webgl/webgl_sprite_renderer.js'
import WebGLCircleRenderer from './webgl/webgl_circle_renderer.js'
import WebGLRectangleRenderer from './webgl/webgl_rectangle_renderer.js'
import WebGLDebugGizmoRenderer from './webgl/webgl_debug_gizmo_renderer.js'


export default class WebGLCanvas2D extends BaseRenderer {

    static $name = 'webGLCanvas2D'

    #rendererRegistry = new Map()
    #renderers = []
    #shaderRegistry = null
    #shaderEffectRegistry = null
    #postProcessor = null
    #debugGizmoRenderer = null

    #compositeQuad = null
    #compositeProgram = null

    constructor (options = {}) {
        super(options)

        this.#setupWebGL()
        this.#setupDefaultRenderers()
        this.applyPixelRatio()

        this.backgroundColor = options.backgroundColor ?? null
        this.enableCulling = options.enableCulling ?? false
        this.enableDebugGizmos = options.enableDebugGizmos ?? true

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
        this.#shaderEffectRegistry = new ShaderEffectRegistry(gl, this.#shaderRegistry)
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

        this.#debugGizmoRenderer = new WebGLDebugGizmoRenderer()
        this.#debugGizmoRenderer.init({
            gl: this.gl,
            spriteProgram: this.spriteProgram,
            primitiveProgram: this.primitiveProgram,
            textureManager: this.textureManager,
            shaderEffectRegistry: this.#shaderEffectRegistry
        })
    }


    registerRenderer (renderer) {
        const context = {
            gl: this.gl,
            spriteProgram: this.spriteProgram,
            primitiveProgram: this.primitiveProgram,
            textureManager: this.textureManager,
            shaderEffectRegistry: this.#shaderEffectRegistry
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


    get shaderEffectRegistry () {
        return this.#shaderEffectRegistry
    }


    registerShaderEffect (EffectClass) {
        return this.#shaderEffectRegistry.register(EffectClass)
    }


    setUniform (name, value, type = null) {
        this.#shaderEffectRegistry.setUniform(name, value, type)
        return this
    }


    getUniform (name) {
        return this.#shaderEffectRegistry.getUniform(name)
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


    setRenderGroups (configs) {
        this.clearRenderGroups()

        if (!this.#compositeProgram) {
            this.#setupCompositeShader()
        }
        if (!this.#compositeQuad) {
            this.#compositeQuad = new FullscreenQuad(this.gl)
        }

        for (const config of configs) {
            this.create(RenderGroup, config)
        }

        return this
    }


    clearRenderGroups () {
        const groups = this.renderGroups
        for (const group of groups) {
            this.removeChild(group.$id)
        }
        return this
    }


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

        if (this.#debugGizmoRenderer) {
            this.#debugGizmoRenderer.dispose()
            this.#debugGizmoRenderer = null
        }

        this.clearRenderGroups()

        if (this.#compositeQuad) {
            this.#compositeQuad.dispose(this.gl)
            this.#compositeQuad = null
        }

        if (this.#postProcessor) {
            this.#postProcessor.dispose()
            this.#postProcessor = null
        }

        if (this.#shaderEffectRegistry) {
            this.#shaderEffectRegistry.dispose()
            this.#shaderEffectRegistry = null
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


    render (scene) {
        if (this.renderGroups.length > 0 && !scene) {
            return this.#renderWithGroups()
        }
        return this.#renderSingleScene(scene)
    }


    #renderSingleScene (scene) {
        this.#resetStats()

        const usePostProcessing = this.#postProcessor.begin()

        this.#clearWithBackground()
        this.camera.update()

        const matrices = this.#getMatrices()

        scene.updateWorldMatrix(false)

        for (const renderer of this.#renderers) {
            renderer.reset()
        }

        const debugGizmoRenderer = this.enableDebugGizmos ? this.#debugGizmoRenderer : null
        if (debugGizmoRenderer) {
            debugGizmoRenderer.reset()
        }

        traverseAndCollect(scene, this.#rendererRegistry, {
            camera: this.camera,
            enableCulling: this.enableCulling,
            stats: this.stats,
            debugGizmoRenderer
        })

        for (const renderer of this.#renderers) {
            renderer.flush(matrices)
        }

        if (debugGizmoRenderer) {
            debugGizmoRenderer.flush(matrices)
        }

        if (usePostProcessing) {
            this.#postProcessor.finish()
        }
    }


    #renderWithGroups () {
        this.#resetStats()
        this.camera.update()
        const matrices = this.#getMatrices()

        this.#renderGroupsToTextures(matrices)
        this.#compositeGroups()
    }


    #renderGroupsToTextures (matrices) {
        for (const group of this.renderGroups) {
            if (group.visible && group.content) {
                this.#renderGroupToTexture(group, matrices)
            }
        }
    }


    #renderGroupToTexture (group, matrices) {
        const gl = this.gl
        const fbManager = this.#postProcessor.framebufferManager

        fbManager.getOrCreateBuffer(group.$name)
        fbManager.bindSceneBuffer()

        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        group.content.updateWorldMatrix(false)


        const renderContext = group.renderTransform?.enabled
            ? {transform: group.renderTransform}
            : null

        for (const renderer of this.#renderers) {
            renderer.reset(renderContext)
        }

        const debugGizmoRenderer = this.enableDebugGizmos ? this.#debugGizmoRenderer : null
        if (debugGizmoRenderer) {
            debugGizmoRenderer.reset()
        }

        traverseAndCollect(group.content, this.#rendererRegistry, {
            camera: this.camera,
            enableCulling: this.enableCulling,
            stats: this.stats,
            debugGizmoRenderer
        })

        for (const renderer of this.#renderers) {
            renderer.flush(matrices, renderContext)
        }

        if (debugGizmoRenderer) {
            debugGizmoRenderer.flush(matrices)
        }

        fbManager.resolveToBuffer(group.$name)

        if (group.hasActivePasses()) {
            this.#applyGroupPasses(group)
        }
    }


    #compositeGroups () {
        const hasGlobalPostProcessing = this.#postProcessor.hasActivePasses()
        const fbManager = this.#postProcessor.framebufferManager

        if (hasGlobalPostProcessing) {
            fbManager.bindSceneBuffer()
        } else {
            fbManager.bindScreen()
        }

        this.#clearWithBackground()
        this.#drawAllGroups()

        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)

        if (hasGlobalPostProcessing) {
            this.#postProcessor.finish()
        }
    }


    #drawAllGroups () {
        const gl = this.gl
        const fbManager = this.#postProcessor.framebufferManager

        this.#compositeProgram.use()
        gl.activeTexture(gl.TEXTURE0)
        this.#compositeProgram.setUniform1i('uTexture', 0)

        for (const group of this.renderGroups) {
            if (!group.visible || !group.content) {
                continue
            }

            const texture = fbManager.getBufferTexture(group.$name)
            if (texture) {
                this.#drawGroup(group, texture)
            }
        }
    }


    #drawGroup (group, texture) {
        const gl = this.gl
        this.#applyBlendMode(group.blendMode)
        this.#compositeProgram.setUniform1f('uOpacity', group.opacity)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        this.#compositeQuad.draw(gl, this.#compositeProgram)
    }


    #resetStats () {
        this.stats.totalObjects = 0
        this.stats.renderedObjects = 0
        this.stats.culledObjects = 0
        this.stats.drawCalls = 0
    }


    #clearWithBackground () {
        const gl = this.gl
        if (this.backgroundColor && this.backgroundColor !== 'transparent') {
            const color = parseColor(this.backgroundColor)
            gl.clearColor(color.r, color.g, color.b, color.a)
        } else {
            gl.clearColor(0, 0, 0, 0)
        }
        gl.clear(gl.COLOR_BUFFER_BIT)
    }


    #applyGroupPasses (group) {
        const gl = this.gl
        const fbManager = this.#postProcessor.framebufferManager
        const activePasses = group.postPasses.filter(pass => pass.enabled)

        if (activePasses.length === 0) {
            return
        }

        gl.disable(gl.BLEND)

        fbManager.resetPingPong()
        fbManager.bindPingPong()
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        this.#compositeProgram.use()
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, fbManager.getBufferTexture(group.$name))
        this.#compositeProgram.setUniform1i('uTexture', 0)
        this.#compositeProgram.setUniform1f('uOpacity', 1.0)
        this.#compositeQuad.draw(gl, this.#compositeProgram)

        let inputTexture = fbManager.swapAndGetTexture()

        for (let i = 0; i < activePasses.length; i++) {
            const isLast = i === activePasses.length - 1

            if (isLast) {
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

        const blendFuncs = {
            [BLEND_MODES.additive]: [gl.ONE, gl.ONE],
            [BLEND_MODES.multiply]: [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA],
            [BLEND_MODES.normal]: [gl.ONE, gl.ONE_MINUS_SRC_ALPHA]
        }

        const [src, dst] = blendFuncs[blendMode] || blendFuncs[BLEND_MODES.normal]
        gl.blendFunc(src, dst)
    }

}
