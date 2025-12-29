import BaseRenderer from './base_renderer'
import {traverseAndCollect} from './traverse'
import ShaderRegistry from './shaders/shader_registry'
import {SPRITE_SHADER_DEF} from './shaders/builtin/sprite_shader'
import {PRIMITIVE_SHADER_DEF} from './shaders/builtin/primitive_shader'
import PostProcessor from './postprocessing/post_processor'
import WebGLTextureManager from './webgl_texture_manager'
import {parseColor} from './webgl/color_utils'

import WebGLSpriteRenderer from './webgl/webgl_sprite_renderer'
import WebGLCircleRenderer from './webgl/webgl_circle_renderer'
import WebGLRectangleRenderer from './webgl/webgl_rectangle_renderer'


export default class WebGLCanvas2D extends BaseRenderer {

    static $name = 'webGLCanvas2D'

    #rendererRegistry = new Map()
    #renderers = []
    #shaderRegistry = null
    #postProcessor = null


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


    onDispose () {
        for (const renderer of this.#renderers) {
            renderer.dispose()
        }
        this.#renderers = []
        this.#rendererRegistry.clear()

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


    render (scene) {
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

}
