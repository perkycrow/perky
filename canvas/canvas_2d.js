import Camera2D from './camera_2d'


export default class Canvas2D {

    constructor (canvas, options = {}) { // eslint-disable-line complexity
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        
        this.pixelRatio = options.pixelRatio ?? 1
        this.displayWidth = options.width ?? canvas.width
        this.displayHeight = options.height ?? canvas.height
        
        this.applyPixelRatio()
        
        this.camera = options.camera ?? new Camera2D({
            viewportWidth: this.canvas.width,
            viewportHeight: this.canvas.height
        })
        
        this.showAxes = options.showAxes ?? false
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


    applyPixelRatio () {
        this.canvas.width = this.displayWidth * this.pixelRatio
        this.canvas.height = this.displayHeight * this.pixelRatio
        
        this.canvas.style.width = `${this.displayWidth}px`
        this.canvas.style.height = `${this.displayHeight}px`
        
        if (this.camera) {
            this.camera.viewportWidth = this.canvas.width
            this.camera.viewportHeight = this.canvas.height
        }
    }


    setPixelRatio (ratio) {
        this.pixelRatio = ratio
        this.applyPixelRatio()
        return this
    }


    resize (width, height) {
        this.displayWidth = width
        this.displayHeight = height
        this.applyPixelRatio()
        return this
    }


    resizeToContainer () {
        const parent = this.canvas.parentElement
        if (!parent) {
            return this
        }
        
        const rect = parent.getBoundingClientRect()
        return this.resize(rect.width, rect.height)
    }


    enableAutoResize (options = {}) {
        const resizeToContainer = options.container ?? false
        
        const handleResize = () => {
            if (resizeToContainer) {
                this.resizeToContainer()
            } else {
                this.resize(window.innerWidth, window.innerHeight)
            }
        }
        
        window.addEventListener('resize', handleResize)
        
        this.disableAutoResize = () => {
            window.removeEventListener('resize', handleResize)
        }
        
        handleResize()
        
        return this
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
