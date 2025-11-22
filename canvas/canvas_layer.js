import Layer from './layer'
import Canvas2D from './canvas_2d'
import Camera2D from './camera_2d'


export default class CanvasLayer extends Layer {

    constructor (name, options = {}) { // eslint-disable-line complexity
        super(name, options)
        
        this.canvas = document.createElement('canvas')
        this.element = this.canvas
        
        this.applyStyles()
        
        const camera = options.camera ?? new Camera2D({
            unitsInView: options.unitsInView ?? 10
        })
        
        this.renderer = new Canvas2D(this.canvas, {
            width: options.width ?? 800,
            height: options.height ?? 600,
            pixelRatio: options.pixelRatio ?? 1,
            camera,
            showAxes: options.showAxes ?? false,
            showGrid: options.showGrid ?? false,
            gridStep: options.gridStep,
            gridOpacity: options.gridOpacity,
            gridColor: options.gridColor,
            backgroundColor: options.backgroundColor,
            enableCulling: options.enableCulling ?? false
        })
        
        this.scene = null
        this.autoRender = options.autoRender ?? true
    }


    applyStyles () {
        this.canvas.style.position = 'absolute'
        this.canvas.style.top = '0'
        this.canvas.style.left = '0'
        this.canvas.style.zIndex = this.zIndex
        this.canvas.style.opacity = this.opacity
        this.canvas.style.pointerEvents = this.pointerEvents
        this.canvas.style.display = this.visible ? 'block' : 'none'
    }


    setScene (scene) {
        this.scene = scene
        this.markDirty()
        return this
    }


    render () {
        if (this.scene && this.dirty) {
            this.renderer.render(this.scene)
            this.markClean()
        }
        return this
    }


    resize (width, height) {
        this.renderer.resize(width, height)
        this.markDirty()
        return this
    }


    destroy () {
        if (this.renderer.disableAutoResize) {
            this.renderer.disableAutoResize()
        }
        super.destroy()
    }

}

