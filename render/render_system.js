import PerkyModule from '../core/perky_module'
import LayerManager from './layer_manager'


export default class RenderSystem extends PerkyModule {

    static $category = 'renderSystem'

    constructor (options = {}) {
        super(options)

        this.create(LayerManager, {
            $bind: 'layerManager',
            container: options.container,
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

        // Listen to resize events from the host
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
