import BaseRenderer from './base_renderer'


export default class Canvas2D extends BaseRenderer {

    static $name = 'canvas2D'


    constructor (options = {}) { // eslint-disable-line complexity
        super(options)

        this.ctx = this.canvas.getContext('2d')

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


    onDispose () {
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

        renderObject(ctx, scene, 1.0, this)

        if (this.showGrid) {
            drawGrid(ctx, this.camera, this.gridOptions)
        }

        ctx.restore()
    }

}


function renderObject (ctx, object, parentOpacity, renderer) {
    if (!object.visible) {
        return
    }

    renderer.stats.totalObjects++

    if (renderer.enableCulling) {
        const worldBounds = object.getWorldBounds()
        if (!renderer.camera.isVisible(worldBounds)) {
            renderer.stats.culledObjects++
            return
        }
    }

    renderer.stats.renderedObjects++

    const effectiveOpacity = parentOpacity * object.opacity

    ctx.save()

    const m = object.worldMatrix
    ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5])

    ctx.globalAlpha = effectiveOpacity
    object.render(ctx)

    object.children.forEach(child => {
        renderObject(ctx, child, effectiveOpacity, renderer)
    })

    ctx.restore()
}


function drawGrid (ctx, camera, options) {
    ctx.save()

    const ppu = camera.pixelsPerUnit
    const step = options.step
    const halfWidth = camera.viewportWidth / (2 * ppu)
    const halfHeight = camera.viewportHeight / (2 * ppu)

    const minX = Math.floor(camera.x - halfWidth)
    const maxX = Math.ceil(camera.x + halfWidth)
    const minY = Math.floor(camera.y - halfHeight)
    const maxY = Math.ceil(camera.y + halfHeight)

    ctx.strokeStyle = options.color
    ctx.lineWidth = options.lineWidth / ppu
    ctx.globalAlpha = options.opacity

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
