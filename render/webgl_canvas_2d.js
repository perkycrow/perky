import BaseRenderer from './base_renderer'
import RenderContext from './unified/render_context'
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
    #renderContext = null
    #postProcessor = null


    constructor (options = {}) { // eslint-disable-line complexity
        super(options)

        this.#setupWebGL()
        this.#setupDefaultRenderers()
        this.applyPixelRatio()

        this.showGrid = options.showGrid ?? false
        this.gridOptions = {
            step: options.gridStep ?? 1,
            opacity: options.gridOpacity ?? 0.5,
            color: options.gridColor ?? '#000000',
            lineWidth: options.gridLineWidth ?? 1
        }
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
        this.gl = this.canvas.getContext('webgl', {
            alpha: true,
            premultipliedAlpha: false,
            antialias: true,
            preserveDrawingBuffer: false
        })

        if (!this.gl) {
            throw new Error('WebGL not supported')
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

        this.#renderContext = new RenderContext({
            type: 'webgl',
            canvas: this.canvas,
            gl,
            shaderRegistry: this.#shaderRegistry,
            textureManager: this.textureManager
        })

        this.#postProcessor = new PostProcessor(
            gl,
            this.#shaderRegistry,
            this.canvas.width,
            this.canvas.height
        )

        this.gridVertexBuffer = gl.createBuffer()
    }


    #setupBuiltinShaders () {
        const spriteProgram = this.#shaderRegistry.register('sprite', SPRITE_SHADER_DEF)
        const primitiveProgram = this.#shaderRegistry.register('primitive', PRIMITIVE_SHADER_DEF)

        this.#shaderRegistry.setDefault('sprite', 'sprite')
        this.#shaderRegistry.setDefault('primitive', 'primitive')

        this.spriteProgram = this.#createLegacyProgramFormat(spriteProgram, {
            position: 'aPosition',
            texCoord: 'aTexCoord',
            opacity: 'aOpacity'
        }, {
            projectionMatrix: 'uProjectionMatrix',
            viewMatrix: 'uViewMatrix',
            modelMatrix: 'uModelMatrix',
            texture: 'uTexture'
        })

        this.primitiveProgram = this.#createLegacyProgramFormat(primitiveProgram, {
            position: 'aPosition',
            color: 'aColor'
        }, {
            projectionMatrix: 'uProjectionMatrix',
            viewMatrix: 'uViewMatrix'
        })
    }


    #createLegacyProgramFormat (shaderProgram, attrMap, uniformMap) {
        const attributes = {}
        const uniforms = {}

        for (const [key, name] of Object.entries(attrMap)) {
            attributes[key] = shaderProgram.attributes[name]
        }

        for (const [key, name] of Object.entries(uniformMap)) {
            uniforms[key] = shaderProgram.uniforms[name]
        }

        return {
            program: shaderProgram.program,
            attributes,
            uniforms
        }
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

        if (this.gl) {
            this.gl.deleteBuffer(this.gridVertexBuffer)
        }

        this.#renderContext = null
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

        this.#traverseAndCollect(scene, 1.0)

        for (const renderer of this.#renderers) {
            renderer.flush(matrices)
        }

        if (this.showGrid) {
            this.#renderGrid(matrices.projectionMatrix, matrices.viewMatrix)
        }

        if (usePostProcessing) {
            this.#postProcessor.finish()
        }
    }


    #traverseAndCollect (object, parentOpacity) {
        if (!object.visible) {
            return
        }

        this.stats.totalObjects++

        if (this.enableCulling) {
            const worldBounds = object.getWorldBounds()
            if (!this.camera.isVisible(worldBounds)) {
                this.stats.culledObjects++
                return
            }
        }

        this.stats.renderedObjects++

        const effectiveOpacity = parentOpacity * object.opacity

        const renderer = this.#rendererRegistry.get(object.constructor)
        if (renderer) {
            const hints = object.renderHints
            renderer.collect(object, effectiveOpacity, hints)
        }

        object.children.forEach(child => {
            this.#traverseAndCollect(child, effectiveOpacity)
        })
    }


    #renderGrid (projectionMatrix, viewMatrix) {
        const gl = this.gl
        const camera = this.camera
        const options = this.gridOptions

        const ppu = camera.pixelsPerUnit
        const step = options.step
        const halfWidth = camera.viewportWidth / (2 * ppu)
        const halfHeight = camera.viewportHeight / (2 * ppu)

        const minX = Math.floor(camera.x - halfWidth)
        const maxX = Math.ceil(camera.x + halfWidth)
        const minY = Math.floor(camera.y - halfHeight)
        const maxY = Math.ceil(camera.y + halfHeight)

        const vertices = []
        const color = parseColor(options.color)
        const opacity = options.opacity

        for (let x = Math.floor(minX / step) * step; x <= maxX; x += step) {
            vertices.push(
                x, minY, color.r, color.g, color.b, opacity,
                x, maxY, color.r, color.g, color.b, opacity
            )
        }

        for (let y = Math.floor(minY / step) * step; y <= maxY; y += step) {
            vertices.push(
                minX, y, color.r, color.g, color.b, opacity,
                maxX, y, color.r, color.g, color.b, opacity
            )
        }

        const vertexData = new Float32Array(vertices)

        gl.useProgram(this.primitiveProgram.program)
        gl.uniformMatrix3fv(this.primitiveProgram.uniforms.projectionMatrix, false, projectionMatrix)
        gl.uniformMatrix3fv(this.primitiveProgram.uniforms.viewMatrix, false, viewMatrix)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.gridVertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW)

        const stride = 6 * 4  // 6 floats

        gl.enableVertexAttribArray(this.primitiveProgram.attributes.position)
        gl.vertexAttribPointer(this.primitiveProgram.attributes.position, 2, gl.FLOAT, false, stride, 0)

        gl.enableVertexAttribArray(this.primitiveProgram.attributes.color)
        gl.vertexAttribPointer(this.primitiveProgram.attributes.color, 4, gl.FLOAT, false, stride, 2 * 4)

        gl.drawArrays(gl.LINES, 0, vertices.length / 6)
    }

}
