import PerkyModule from '../core/perky_module'
import LayerManager from './layer_manager'


export default class RenderSystem extends PerkyModule {

    static $category = 'renderSystem'

    constructor (options = {}) {
        super(options)

        // Create default LayerManager (using old system for now)
        this.layerManager = new LayerManager({
            container: options.container,
            width: options.width,
            height: options.height,
            autoResize: options.autoResize,
            cameras: options.cameras,
            layers: options.layers
        })
    }


    onInstall (host) {
        // Delegate LayerManager methods to the host for convenience
        host.delegate(this, {
            layerManager: 'layerManager'
        })

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
    }


    onDispose () {
        if (this.layerManager) {
            this.layerManager.destroy()
            this.layerManager = null
        }
    }


    // Wrapper methods for LayerManager

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
