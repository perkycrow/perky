import BaseRenderer from './base_renderer'

import CanvasCircleRenderer from './canvas/canvas_circle_renderer'
import CanvasRectangleRenderer from './canvas/canvas_rectangle_renderer'
import CanvasImageRenderer from './canvas/canvas_image_renderer'
import CanvasSpriteRenderer from './canvas/canvas_sprite_renderer'


export default class Canvas2D extends BaseRenderer {

    static $name = 'canvas2D'

    #rendererRegistry = new Map()
    #renderers = []


    constructor (options = {}) { // eslint-disable-line complexity
        super(options)

        this.ctx = this.canvas.getContext('2d')

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
            culledObjects: 0
        }
    }


    #setupDefaultRenderers () {
        this.registerRenderer(new CanvasCircleRenderer())
        this.registerRenderer(new CanvasRectangleRenderer())
        this.registerRenderer(new CanvasImageRenderer())
        this.registerRenderer(new CanvasSpriteRenderer())
    }


    registerRenderer (renderer) {
        renderer.init(this.ctx)

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


    onDispose () {
        for (const renderer of this.#renderers) {
            renderer.dispose()
        }
        this.#renderers = []
        this.#rendererRegistry.clear()

        super.onDispose()
        this.ctx = null
    }


    render (scene) {
        const ctx = this.ctx

        this.stats.totalObjects = 0
        this.stats.renderedObjects = 0
        this.stats.culledObjects = 0

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.backgroundColor && this.backgroundColor !== 'transparent') {
            ctx.fillStyle = this.backgroundColor
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }

        this.camera.update()

        ctx.save()
        this.camera.applyToContext(ctx, this.pixelRatio)

        scene.updateWorldMatrix(false)

        this.#renderObject(ctx, scene, 1.0)

        if (this.showGrid) {
            this.#drawGrid(ctx)
        }

        ctx.restore()
    }


    #renderObject (ctx, object, parentOpacity) {
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

        ctx.save()

        const m = object.worldMatrix
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5])

        ctx.globalAlpha = effectiveOpacity

        const renderer = this.#rendererRegistry.get(object.constructor)
        if (renderer) {
            renderer.render(object, ctx)
        }

        object.children.forEach(child => {
            this.#renderObject(ctx, child, effectiveOpacity)
        })

        ctx.restore()
    }


    #drawGrid (ctx) {
        ctx.save()

        const ppu = this.camera.pixelsPerUnit
        const step = this.gridOptions.step
        const halfWidth = this.camera.viewportWidth / (2 * ppu)
        const halfHeight = this.camera.viewportHeight / (2 * ppu)

        const minX = Math.floor(this.camera.x - halfWidth)
        const maxX = Math.ceil(this.camera.x + halfWidth)
        const minY = Math.floor(this.camera.y - halfHeight)
        const maxY = Math.ceil(this.camera.y + halfHeight)

        ctx.strokeStyle = this.gridOptions.color
        ctx.lineWidth = this.gridOptions.lineWidth / ppu
        ctx.globalAlpha = this.gridOptions.opacity

        ctx.beginPath()

        for (let x = Math.floor(minX / step) * step; x <= maxX; x += step) {
            ctx.moveTo(x, minY)
            ctx.lineTo(x, maxY)
        }

        for (let y = Math.floor(minY / step) * step; y <= maxY; y += step) {
            ctx.moveTo(minX, y)
            ctx.lineTo(maxX, y)
        }

        ctx.stroke()
        ctx.restore()
    }

}
