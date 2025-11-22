import CanvasLayer from './canvas_layer'
import HTMLLayer from './html_layer'


export default class LayerManager {

    constructor (options = {}) {
        this.container = options.container ?? createContainer()
        this.layers = new Map()
        this.width = options.width ?? 800
        this.height = options.height ?? 600
        
        this.setupContainer()
        
        if (options.layers) {
            options.layers.forEach(layerConfig => {
                this.createLayer(layerConfig.name, layerConfig.type, layerConfig)
            })
        }
        
        if (options.autoResize) {
            this.enableAutoResize(options.autoResize)
        }
    }


    setupContainer () {
        if (!this.container.style.position || this.container.style.position === 'static') {
            this.container.style.position = 'relative'
        }
        
        if (!this.container.style.width) {
            this.container.style.width = `${this.width}px`
        }
        
        if (!this.container.style.height) {
            this.container.style.height = `${this.height}px`
        }
        
        this.container.style.overflow = 'hidden'
    }


    createLayer (name, type = 'canvas', options = {}) {
        if (this.layers.has(name)) {
            throw new Error(`Layer "${name}" already exists`)
        }
        
        const layerOptions = {
            ...options,
            width: this.width,
            height: this.height
        }
        
        let layer
        if (type === 'canvas') {
            layer = new CanvasLayer(name, layerOptions)
        } else if (type === 'html') {
            layer = new HTMLLayer(name, layerOptions)
        } else {
            throw new Error(`Unknown layer type: ${type}`)
        }
        
        layer.mount(this.container)
        this.layers.set(name, layer)
        
        this.sortLayers()
        
        return layer
    }


    getLayer (name) {
        return this.layers.get(name)
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
        const layer = this.layers.get(name)
        if (layer) {
            layer.destroy()
            this.layers.delete(name)
        }
        return this
    }


    sortLayers () {
        const sorted = Array.from(this.layers.values())
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
        
        this.layers.forEach(layer => {
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


    enableAutoResize (options = {}) {
        const resizeToParent = options.container ?? false
        
        const handleResize = () => {
            if (resizeToParent) {
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


    renderAll () {
        this.layers.forEach(layer => {
            if (layer instanceof CanvasLayer && layer.autoRender) {
                layer.render()
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
        this.layers.forEach(layer => layer.markDirty())
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


    destroy () {
        if (this.disableAutoResize) {
            this.disableAutoResize()
        }
        
        this.layers.forEach(layer => layer.destroy())
        this.layers.clear()
        
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container)
        }
    }

}

function createContainer () {
    const container = document.createElement('div')
    container.className = 'layer-manager-container'
    return container
}