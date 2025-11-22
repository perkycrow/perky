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
    }


    render (scene) {
        const ctx = this.ctx
        
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
    
    const effectiveOpacity = parentOpacity * object.opacity
    
    ctx.save()
    
    const m = object.worldMatrix
    ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5])
    
    if (object.opacity < 1 && object.children.length > 0) {
        renderObjectWithGroupOpacity(ctx, object, effectiveOpacity, renderer)
    } else {
        ctx.globalAlpha = effectiveOpacity
        object.render(ctx)
        
        object.children.forEach(child => {
            renderObject(ctx, child, effectiveOpacity, renderer)
        })
    }
    
    ctx.restore()
}


function renderObjectWithGroupOpacity (ctx, object, effectiveOpacity, renderer) {
    const bounds = calculateBounds(object)
    
    if (!bounds) {
        ctx.globalAlpha = effectiveOpacity
        object.render(ctx)
        object.children.forEach(child => {
            renderObject(ctx, child, effectiveOpacity, renderer)
        })
        return
    }
    
    const width = Math.ceil(bounds.width)
    const height = Math.ceil(bounds.height)
    
    if (width <= 0 || height <= 0) {
        return
    }
    
    const offCanvas = document.createElement('canvas')
    offCanvas.width = width
    offCanvas.height = height
    const offCtx = offCanvas.getContext('2d')
    
    offCtx.save()
    offCtx.translate(-bounds.minX, -bounds.minY)
    
    object.render(offCtx)
    object.children.forEach(child => {
        renderObject(offCtx, child, 1.0, renderer)
    })
    
    offCtx.restore()
    
    ctx.globalAlpha = effectiveOpacity
    ctx.drawImage(offCanvas, bounds.minX, bounds.minY)
}


function calculateBounds (object) {
    return null
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
