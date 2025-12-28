import PerkyModule from '../core/perky_module'
import PerkyView from '../application/perky_view'
import CanvasLayer from './canvas_layer'
import HTMLLayer from './html_layer'
import Camera2D from './camera_2d'
import RendererFactory from './renderer_factory'


export default class RenderSystem extends PerkyModule {

    static $category = 'renderSystem'

    constructor (options = {}) { // eslint-disable-line complexity
        super(options)

        this.create(PerkyView, {
            $bind: 'view',
            className: options.className || 'render-system-container',
            position: 'absolute'
        })

        if (options.container) {
            this.mount(options.container)
        }

        this.layerWidth = options.width ?? 800
        this.layerHeight = options.height ?? 600

        const hasExplicitDimensions = options.width !== undefined || options.height !== undefined
        this.autoResizeEnabled = options.autoResize ?? !hasExplicitDimensions

        this.setupCameras(options.cameras)

        if (options.layers) {
            options.layers.forEach(layerConfig => {
                this.createLayer(layerConfig.name, layerConfig.type, layerConfig)
            })
        }

        this.on('resize', ({width, height}) => {
            if (this.autoResizeEnabled) {
                this.resize(width, height)
            }
        })
    }


    // Delegate PerkyView methods for element/container access
    get element () {
        return this.view.element
    }

    get container () {
        return this.view.container
    }

    mount (container) {
        return this.view.mount(container)
    }

    dismount () {
        return this.view.dismount()
    }

    get mounted () {
        return this.view.mounted
    }


    setupCameras (camerasConfig = {}) {
        const hasMainInConfig = 'main' in camerasConfig

        if (!hasMainInConfig) {
            this.createCamera('main', {
                unitsInView: 10,
                viewportWidth: this.layerWidth,
                viewportHeight: this.layerHeight
            })
        }

        Object.entries(camerasConfig).forEach(([id, config]) => {
            this.createCamera(id, config)
        })

        return this
    }


    createCamera (id, config = {}) {
        const options = {
            $id: id,
            viewportWidth: this.layerWidth,
            viewportHeight: this.layerHeight,
            ...config
        }

        return this.create(Camera2D, options)
    }


    getCamera (id = 'main') {
        const camera = this.getChild(id)
        if (!camera || camera.$category !== 'camera') {
            throw new Error(`Camera "${id}" not found`)
        }
        return camera
    }


    setCamera (id, config) {
        const existing = this.getChild(id)
        if (existing && existing.$category === 'camera') {
            this.removeChild(id)
        }
        return this.createCamera(id, config)
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

        if (typeof cameraOption === 'object') {
            return this.createCamera(cameraOption.$id || 'unnamed', cameraOption)
        }

        return null
    }



    createLayer (name, type = 'canvas', options = {}) {
        if (this.childrenRegistry.has(name)) {
            throw new Error(`Layer "${name}" already exists`)
        }

        const camera = this.resolveCamera(options.camera)

        const layerOptions = {
            $id: name,
            $category: 'layer',
            ...options,
            width: this.layerWidth,
            height: this.layerHeight,
            camera,
            layerManager: this
        }

        let LayerClass
        if (RendererFactory.isValidType(type)) {
            LayerClass = CanvasLayer
            layerOptions.rendererType = type
        } else if (type === 'html') {
            LayerClass = HTMLLayer
        } else {
            const validTypes = [...RendererFactory.getAvailableTypes(), 'html']
            throw new Error(`Unknown layer type: "${type}". Available: ${validTypes.join(', ')}`)
        }

        const layer = this.create(LayerClass, layerOptions)
        layer.mount(this.element)
        this.sortLayers()

        return layer
    }


    getLayer (name) {
        return this.getChild(name)
    }


    getCanvas (name) {
        const layer = this.getLayer(name)
        if (layer instanceof CanvasLayer) {
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
        // Use childrenByCategory to get only layers (exclude internal view)
        const sorted = this.childrenByCategory('layer')
            .sort((a, b) => a.zIndex - b.zIndex)

        sorted.forEach(layer => {
            if (layer.element && layer.element.parentElement) {
                this.element.appendChild(layer.element)
            }
        })

        return this
    }


    resize (width, height) {
        this.layerWidth = width
        this.layerHeight = height

        this.childrenByCategory('camera').forEach(camera => {
            camera.viewportWidth = width
            camera.viewportHeight = height
        })

        this.childrenByCategory('layer').forEach(layer => {
            layer.resize(width, height)
        })

        return this
    }


    resizeToContainer () {
        const width = this.view.element.clientWidth
        const height = this.view.element.clientHeight

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
        this.childrenByCategory('layer').forEach(layer => {
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
        this.childrenByCategory('layer').forEach(layer => layer.markDirty())
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


    onInstall (host) {
        this.delegateTo(host, [
            'createLayer',
            'getLayer',
            'getCanvas',
            'getHTML',
            'removeLayer',
            'renderAll',
            'renderLayer',
            'showLayer',
            'hideLayer',
            'createCamera',
            'getCamera',
            'setCamera'
        ])

        if (host.element) {
            this.mount(host.element)
        } else if (host.mounted !== undefined) {
            this.listenToOnce(host, 'mount', () => {
                this.mount(host.element)
            })
        }
    }


    onDispose () {
        if (this.view?.element?.parentElement) {
            this.view.element.parentElement.removeChild(this.view.element)
        }
    }

}
