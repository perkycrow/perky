import PerkyModule from '../core/perky_module'
import CanvasLayer from './canvas_layer'
import WebGLCanvasLayer from './webgl_canvas_layer'
import HTMLLayer from './html_layer'
import Camera2D from './camera_2d'


export default class LayerManager extends PerkyModule {

    static $category = 'layerManager'

    constructor (options = {}) { // eslint-disable-line complexity
        super(options)

        this.container = createContainer()

        this.parentContainer = options.parentContainer

        if (this.parentContainer) {
            this.mountContainer()
        }

        this.cameras = new Map()
        this.width = options.width ?? 800
        this.height = options.height ?? 600

        const hasExplicitDimensions = options.width !== undefined || options.height !== undefined
        this.autoResizeEnabled = options.autoResize ?? !hasExplicitDimensions

        this.setupCameras(options.cameras)

        if (options.layers) {
            options.layers.forEach(layerConfig => {
                this.createLayer(layerConfig.name, layerConfig.type, layerConfig)
            })
        }


    }


    setupCameras (camerasConfig = {}) {
        this.cameras.set('main', new Camera2D({
            unitsInView: 10,
            viewportWidth: this.width,
            viewportHeight: this.height
        }))

        Object.entries(camerasConfig).forEach(([id, camera]) => {
            if (!camera.viewportWidth) {
                camera.viewportWidth = this.width
            }
            if (!camera.viewportHeight) {
                camera.viewportHeight = this.height
            }
            this.cameras.set(id, camera)
        })

        return this
    }


    getCamera (id = 'main') {
        const camera = this.cameras.get(id)
        if (!camera) {
            throw new Error(`Camera "${id}" not found`)
        }
        return camera
    }


    setCamera (id, camera) {
        this.cameras.set(id, camera)
        return this
    }


    resolveCamera (cameraOption) {
        if (!cameraOption) {
            return null
        }

        if (typeof cameraOption === 'string') {
            return this.getCamera(cameraOption)
        }

        if (cameraOption instanceof Camera2D) {
            return cameraOption
        }

        return null
    }


    mountContainer () {
        if (!this.parentContainer) {
            throw new Error('Cannot mount: no parentContainer set')
        }

        // Set container styles for proper layout
        Object.assign(this.container.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
        })

        this.parentContainer.appendChild(this.container)
    }


    createLayer (name, type = 'canvas', options = {}) {
        if (this.childrenRegistry.has(name)) {
            throw new Error(`Layer "${name}" already exists`)
        }

        const camera = this.resolveCamera(options.camera)

        const layerOptions = {
            $name: name,
            ...options,
            width: this.width,
            height: this.height,
            camera,
            layerManager: this
        }

        const layerTypes = {
            canvas: CanvasLayer,
            webgl: WebGLCanvasLayer,
            html: HTMLLayer
        }

        const LayerClass = layerTypes[type]

        if (!LayerClass) {
            throw new Error(`Unknown layer type: ${type}`)
        }

        const layer = this.create(LayerClass, layerOptions)
        layer.mount(this.container)
        this.sortLayers()

        return layer
    }


    getLayer (name) {
        return this.getChild(name)
    }


    getCanvas (name) {
        const layer = this.getLayer(name)
        if (layer instanceof CanvasLayer || layer instanceof WebGLCanvasLayer) {
            return layer
        }
        throw new Error(`Layer "${name}" is not a canvas layer`)
    }


    getHTML (name) {
        const layer = this.getLayer(name)
        if (layer instanceof HTMLLayer) {
            return layer
        }
        throw new Error(`Layer "${name}" is not an HTML layer`)
    }


    removeLayer (name) {
        return this.removeChild(name)
    }


    sortLayers () {
        const sorted = this.children
            .sort((a, b) => a.zIndex - b.zIndex)

        sorted.forEach(layer => {
            if (layer.element && layer.element.parentElement) {
                this.container.appendChild(layer.element)
            }
        })

        return this
    }


    resize (width, height) {
        this.width = width
        this.height = height

        this.container.style.width = `${width}px`
        this.container.style.height = `${height}px`

        this.children.forEach(layer => {
            layer.resize(width, height)
        })

        return this
    }


    resizeToContainer () {
        const width = this.container.clientWidth
        const height = this.container.clientHeight

        if (width > 0 && height > 0) {
            return this.resize(width, height)
        }

        return this
    }


    enableAutoResize () {
        this.autoResizeEnabled = true
        return this
    }


    disableAutoResize () {
        this.autoResizeEnabled = false
        return this
    }


    renderAll () {
        this.children.forEach(layer => {
            if (layer instanceof CanvasLayer && layer.autoRender) {
                layer.render()
            }
            if (layer instanceof HTMLLayer && layer.autoUpdate) {
                layer.updateWorldElements()
            }
        })
        return this
    }


    renderLayer (name) {
        const layer = this.getLayer(name)
        if (layer instanceof CanvasLayer) {
            layer.render()
        }
        return this
    }


    markAllDirty () {
        this.children.forEach(layer => layer.markDirty())
        return this
    }


    showLayer (name) {
        const layer = this.getLayer(name)
        if (layer) {
            layer.setVisible(true)
        }
        return this
    }


    hideLayer (name) {
        const layer = this.getLayer(name)
        if (layer) {
            layer.setVisible(false)
        }
        return this
    }


    onDispose () {
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container)
        }
    }

}

function createContainer () {
    const container = document.createElement('div')
    container.className = 'layer-manager-container'
    return container
}