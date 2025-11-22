import Camera2D from './camera_2d'


export default class Canvas2D {

    constructor (canvas, options = {}) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        
        this.camera = options.camera ?? new Camera2D({
            viewportWidth: canvas.width,
            viewportHeight: canvas.height
        })
        
        this.showAxes = options.showAxes ?? false
        this.backgroundColor = options.backgroundColor ?? null
        this.enableCulling = options.enableCulling ?? false
        
        this.stats = {
            totalObjects: 0,
            renderedObjects: 0,
            culledObjects: 0
        }
    }


    render (scene) {
        const ctx = this.ctx
        
        this.stats.totalObjects = 0
        this.stats.renderedObjects = 0
        this.stats.culledObjects = 0
        
        if (this.backgroundColor) {
            ctx.fillStyle = this.backgroundColor
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        } else {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }
        
        this.camera.update()
        
        ctx.save()
        this.camera.applyToContext(ctx)
        
        if (this.showAxes) {
            drawAxes(ctx, this.camera)
        }
        
        scene.updateWorldMatrix(true)
        
        renderObject(ctx, scene, 1.0, this)
        
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


function drawAxes (ctx, camera) {
    ctx.save()
    
    const ppu = camera.pixelsPerUnit
    const maxUnits = Math.max(camera.viewportWidth, camera.viewportHeight) / ppu
    
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1 / ppu
    
    ctx.beginPath()
    ctx.moveTo(-maxUnits, 0)
    ctx.lineTo(maxUnits, 0)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(0, -maxUnits)
    ctx.lineTo(0, maxUnits)
    ctx.stroke()
    
    ctx.save()
    ctx.scale(1, -1)
    ctx.font = `${0.5}px Arial`
    ctx.fillStyle = '#999999'
    ctx.fillText('X+', maxUnits - 1, 0.3)
    ctx.fillText('Y+', 0.1, -maxUnits + 0.8)
    ctx.restore()
    
    ctx.restore()
}
