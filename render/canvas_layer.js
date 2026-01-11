import Layer from './layer.js'
import CanvasRenderer from './canvas_renderer.js'
import WebGLRenderer from './webgl_renderer.js'


const RENDERERS = {
    canvas: CanvasRenderer,
    webgl: WebGLRenderer
}


export default class CanvasLayer extends Layer {

    constructor (options = {}) { // eslint-disable-line complexity -- clean
        super(options)

        this.canvas = document.createElement('canvas')
        this.element = this.canvas
        this.rendererType = options.rendererType ?? 'canvas'

        this.applyStyles()

        const width = options.width ?? 800
        const height = options.height ?? 600
        const pixelRatio = options.pixelRatio ?? 1

        const vp = this.calculateViewport(width, height)

        const camera = options.camera
        if (camera) {
            camera.viewportWidth = vp.width
            camera.viewportHeight = vp.height
            camera.pixelRatio ??= 1
        }

        const RendererClass = RENDERERS[this.rendererType]
        if (!RendererClass) {
            throw new Error(`Unknown renderer type: "${this.rendererType}"`)
        }

        this.create(RendererClass, {
            $bind: 'renderer',
            canvas: this.canvas,
            width: vp.width,
            height: vp.height,
            pixelRatio,
            camera,
            showGrid: options.showGrid ?? false,
            gridStep: options.gridStep,
            gridOpacity: options.gridOpacity,
            gridColor: options.gridColor,
            backgroundColor: options.backgroundColor,
            enableCulling: options.enableCulling ?? false
        })

        this.content = null
        this.autoRender = options.autoRender ?? true

        this.applyViewport()
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


    setContent (content) {
        this.content = content
        this.markDirty()
        return this
    }


    render () {
        if (!this.dirty) {
            return this
        }

        if (this.renderer.renderGroups?.length > 0) {
            this.renderer.render()
        } else if (this.content) {
            this.renderer.render(this.content)
        }

        this.markClean()
        return this
    }


    resize (width, height) {
        const vp = this.calculateViewport(width, height)
        this.renderer.resize(vp.width, vp.height)
        this.applyViewport()
        this.markDirty()
        return this
    }

}
