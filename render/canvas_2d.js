import BaseRenderer from './base_renderer.js'
import {traverseAndCollect} from './traverse.js'

import CanvasCircleRenderer from './canvas/canvas_circle_renderer.js'
import CanvasRectangleRenderer from './canvas/canvas_rectangle_renderer.js'
import CanvasImageRenderer from './canvas/canvas_image_renderer.js'
import CanvasSpriteRenderer from './canvas/canvas_sprite_renderer.js'
import CanvasDebugGizmoRenderer from './canvas/canvas_debug_gizmo_renderer.js'


export default class Canvas2D extends BaseRenderer {

    static $name = 'canvas2D'

    #rendererRegistry = new Map()
    #renderers = []
    #debugGizmoRenderer = null

    constructor (options = {}) {
        super(options)

        this.ctx = this.canvas.getContext('2d')

        this.#setupDefaultRenderers()
        this.applyPixelRatio()

        this.backgroundColor = options.backgroundColor ?? null
        this.enableCulling = options.enableCulling ?? false
        this.enableDebugGizmos = options.enableDebugGizmos ?? true

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

        this.#debugGizmoRenderer = new CanvasDebugGizmoRenderer()
        this.#debugGizmoRenderer.init({ctx: this.ctx, canvas: this.canvas})
    }


    registerRenderer (renderer) {
        renderer.init({ctx: this.ctx, canvas: this.canvas})

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

        if (this.#debugGizmoRenderer) {
            this.#debugGizmoRenderer.dispose()
            this.#debugGizmoRenderer = null
        }

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
            renderer.flush()
        }

        if (debugGizmoRenderer) {
            debugGizmoRenderer.flush()
        }

        ctx.restore()
    }

}
