import BaseRenderer from './base_renderer'
import {createSpriteProgram, createPrimitiveProgram} from './webgl_shaders'
import WebGLTextureManager from './webgl_texture_manager'
import WebGLSpriteBatch from './webgl_sprite_batch'
import Image2D from './image_2d'
import Sprite2D from './sprite_2d'
import Circle from './circle'
import Rectangle from './rectangle'


export default class WebGLCanvas2D extends BaseRenderer {

    static $name = 'webGLCanvas2D'


    constructor (options = {}) { // eslint-disable-line complexity
        super(options)

        this.#setupWebGL()
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
            premultipliedAlpha: true,
            antialias: true
        })

        if (!this.gl) {
            throw new Error('WebGL not supported')
        }

        const gl = this.gl

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        this.spriteProgram = createSpriteProgram(gl)
        this.primitiveProgram = createPrimitiveProgram(gl)

        this.create(WebGLTextureManager, {
            $bind: 'textureManager',
            gl
        })
        this.spriteBatch = new WebGLSpriteBatch(gl, this.spriteProgram, this.textureManager)

        this.gridVertexBuffer = gl.createBuffer()
        this.primitiveVertexBuffer = gl.createBuffer()
        this.primitives = []
    }


    applyPixelRatio () {
        super.applyPixelRatio()

        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
        }
    }


    onDispose () {
        if (this.spriteBatch) {
            this.spriteBatch.dispose()
        }

        if (this.gl) {
            this.gl.deleteProgram(this.spriteProgram.program)
            this.gl.deleteProgram(this.primitiveProgram.program)
            this.gl.deleteBuffer(this.gridVertexBuffer)
            this.gl.deleteBuffer(this.primitiveVertexBuffer)
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

        if (this.backgroundColor && this.backgroundColor !== 'transparent') {
            const color = parseColor(this.backgroundColor)
            gl.clearColor(color.r, color.g, color.b, color.a)
        } else {
            gl.clearColor(0, 0, 0, 0)
        }
        gl.clear(gl.COLOR_BUFFER_BIT)

        this.camera.update()

        const {projectionMatrix, viewMatrix} = this.#getMatrices()

        scene.updateWorldMatrix(false)

        this.primitives = []
        this.#renderSprites(scene, projectionMatrix, viewMatrix)
        this.#renderPrimitives(projectionMatrix, viewMatrix)

        if (this.showGrid) {
            this.#renderGrid(projectionMatrix, viewMatrix)
        }
    }


    #renderSprites (scene, projectionMatrix, viewMatrix) {
        const gl = this.gl

        gl.useProgram(this.spriteProgram.program)

        gl.uniformMatrix3fv(this.spriteProgram.uniforms.projectionMatrix, false, projectionMatrix)
        gl.uniformMatrix3fv(this.spriteProgram.uniforms.viewMatrix, false, viewMatrix)

        const identityMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]
        gl.uniformMatrix3fv(this.spriteProgram.uniforms.modelMatrix, false, identityMatrix)

        this.spriteBatch.begin()
        this.#traverseAndBatch(scene, 1.0)
        this.spriteBatch.end()
    }


    #traverseAndBatch (object, parentOpacity) { // eslint-disable-line complexity
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

        if (object instanceof Image2D || object instanceof Sprite2D) {
            this.spriteBatch.addSprite(object, effectiveOpacity)
        } else if (object instanceof Circle || object instanceof Rectangle) {
            this.primitives.push({object, opacity: effectiveOpacity})
        }

        object.children.forEach(child => {
            this.#traverseAndBatch(child, effectiveOpacity)
        })
    }


    #renderPrimitives (projectionMatrix, viewMatrix) {
        if (this.primitives.length === 0) {
            return
        }

        const gl = this.gl
        gl.useProgram(this.primitiveProgram.program)
        gl.uniformMatrix3fv(this.primitiveProgram.uniforms.projectionMatrix, false, projectionMatrix)
        gl.uniformMatrix3fv(this.primitiveProgram.uniforms.viewMatrix, false, viewMatrix)

        for (const {object, opacity} of this.primitives) {
            if (object instanceof Circle) {
                this.#renderCircle(object, opacity)
            } else if (object instanceof Rectangle) {
                this.#renderRectangle(object, opacity)
            }
        }
    }


    #renderCircle (circle, opacity) {
        const gl = this.gl
        const segments = 32
        const radius = circle.radius
        const offsetX = -radius * 2 * circle.anchorX + radius
        const offsetY = -radius * 2 * circle.anchorY + radius

        const color = parseColor(circle.color)
        const m = circle.worldMatrix

        const vertices = []

        const centerX = m[0] * offsetX + m[2] * offsetY + m[4]
        const centerY = m[1] * offsetX + m[3] * offsetY + m[5]
        vertices.push(centerX, centerY, color.r, color.g, color.b, opacity)

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            const x = offsetX + Math.cos(angle) * radius
            const y = offsetY + Math.sin(angle) * radius

            const worldX = m[0] * x + m[2] * y + m[4]
            const worldY = m[1] * x + m[3] * y + m[5]

            vertices.push(worldX, worldY, color.r, color.g, color.b, opacity)
        }

        const vertexData = new Float32Array(vertices)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.primitiveVertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW)

        const stride = 6 * 4
        gl.enableVertexAttribArray(this.primitiveProgram.attributes.position)
        gl.vertexAttribPointer(this.primitiveProgram.attributes.position, 2, gl.FLOAT, false, stride, 0)

        gl.enableVertexAttribArray(this.primitiveProgram.attributes.color)
        gl.vertexAttribPointer(this.primitiveProgram.attributes.color, 4, gl.FLOAT, false, stride, 2 * 4)

        gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 2)
    }


    #renderRectangle (rect, opacity) {
        const gl = this.gl
        const offsetX = -rect.width * rect.anchorX
        const offsetY = -rect.height * rect.anchorY
        const m = rect.worldMatrix

        const corners = [
            {x: offsetX, y: offsetY},
            {x: offsetX + rect.width, y: offsetY},
            {x: offsetX + rect.width, y: offsetY + rect.height},
            {x: offsetX, y: offsetY + rect.height}
        ]

        const worldCorners = corners.map(corner => ({
            x: m[0] * corner.x + m[2] * corner.y + m[4],
            y: m[1] * corner.x + m[3] * corner.y + m[5]
        }))

        if (rect.color && rect.color !== 'transparent') {
            const color = parseColor(rect.color)
            const vertices = []

            for (const wc of worldCorners) {
                vertices.push(wc.x, wc.y, color.r, color.g, color.b, opacity)
            }

            const vertexData = new Float32Array(vertices)

            gl.bindBuffer(gl.ARRAY_BUFFER, this.primitiveVertexBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW)

            const stride = 6 * 4
            gl.enableVertexAttribArray(this.primitiveProgram.attributes.position)
            gl.vertexAttribPointer(this.primitiveProgram.attributes.position, 2, gl.FLOAT, false, stride, 0)

            gl.enableVertexAttribArray(this.primitiveProgram.attributes.color)
            gl.vertexAttribPointer(this.primitiveProgram.attributes.color, 4, gl.FLOAT, false, stride, 2 * 4)

            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
        }

        if (rect.strokeWidth > 0) {
            const strokeColor = parseColor(rect.strokeColor)
            const vertices = []

            for (let i = 0; i < 4; i++) {
                const start = worldCorners[i]
                const end = worldCorners[(i + 1) % 4]
                vertices.push(
                    start.x, start.y, strokeColor.r, strokeColor.g, strokeColor.b, opacity,
                    end.x, end.y, strokeColor.r, strokeColor.g, strokeColor.b, opacity
                )
            }

            const vertexData = new Float32Array(vertices)

            gl.bindBuffer(gl.ARRAY_BUFFER, this.primitiveVertexBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW)

            const stride = 6 * 4
            gl.enableVertexAttribArray(this.primitiveProgram.attributes.position)
            gl.vertexAttribPointer(this.primitiveProgram.attributes.position, 2, gl.FLOAT, false, stride, 0)

            gl.enableVertexAttribArray(this.primitiveProgram.attributes.color)
            gl.vertexAttribPointer(this.primitiveProgram.attributes.color, 4, gl.FLOAT, false, stride, 2 * 4)

            gl.lineWidth(rect.strokeWidth)
            gl.drawArrays(gl.LINES, 0, 8)
        }
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


function parseColor (colorString) {
    if (colorString.startsWith('#')) {
        const hex = colorString.substring(1)
        const r = parseInt(hex.substring(0, 2), 16) / 255
        const g = parseInt(hex.substring(2, 4), 16) / 255
        const b = parseInt(hex.substring(4, 6), 16) / 255
        return {r, g, b, a: 1}
    }
    return {r: 0, g: 0, b: 0, a: 1}
}