import PerkyModule from '../core/perky_module'
import LayerManager from './layer_manager'


export default class RenderSystem extends PerkyModule {

    static $category = 'renderSystem'

    constructor (options = {}) {
        super(options)

        this.create(LayerManager, {
            $bind: 'layerManager',
            width: options.width,
            height: options.height,
            autoResize: options.autoResize,
            cameras: options.cameras,
            layers: options.layers
        })
    }


    onInstall (host) {
        host.delegate(this, [
            'createLayer',
            'getLayer',
            'getCanvas',
            'getHTML',
            'removeLayer',
            'renderAll',
            'renderLayer',
            'showLayer',
            'hideLayer',
            'getCamera',
            'setCamera'
        ])

        // Intelligent mounting: mount LayerManager container into host element
        const mountLayerManager = () => {
            if (host.element) {
                this.layerManager.parentContainer = host.element
                this.layerManager.mountContainer()
            }
        }

        // If host already has an element, mount immediately
        if (host.element) {
            mountLayerManager()
        } else if (host.mounted !== undefined) {
            // If host has mounted state, wait for mount event
            this.listenToOnce(host, 'mount', mountLayerManager)
        }

        // Listen for resize events from host
        this.listenTo(host, 'resize', ({width, height}) => {
            if (this.layerManager.autoResizeEnabled) {
                this.layerManager.resize(width, height)
            }
        })
    }


    createLayer (name, type = 'canvas', options = {}) {
        return this.layerManager.createLayer(name, type, options)
    }


    getLayer (name) {
        return this.layerManager.getLayer(name)
    }


    getCanvas (name) {
        return this.layerManager.getCanvas(name)
    }


    getHTML (name) {
        return this.layerManager.getHTML(name)
    }


    removeLayer (name) {
        return this.layerManager.removeLayer(name)
    }


    renderAll () {
        return this.layerManager.renderAll()
    }


    renderLayer (name) {
        return this.layerManager.renderLayer(name)
    }


    showLayer (name) {
        return this.layerManager.showLayer(name)
    }


    hideLayer (name) {
        return this.layerManager.hideLayer(name)
    }


    getCamera (id = 'main') {
        return this.layerManager.getCamera(id)
    }


    setCamera (id, camera) {
        return this.layerManager.setCamera(id, camera)
    }

}
