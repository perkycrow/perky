export default class Layer {

    constructor (name, options = {}) {
        this.name = name
        this.zIndex = options.zIndex ?? 0
        this.visible = options.visible ?? true
        this.opacity = options.opacity ?? 1
        this.pointerEvents = options.pointerEvents ?? 'auto'
        this.dirty = true
        
        this.element = null
        this.container = null
    }


    setZIndex (zIndex) {
        this.zIndex = zIndex
        if (this.element) {
            this.element.style.zIndex = zIndex
        }
        return this
    }


    setVisible (visible) {
        this.visible = visible
        if (this.element) {
            this.element.style.display = visible ? 'block' : 'none'
        }
        return this
    }


    setOpacity (opacity) {
        this.opacity = opacity
        if (this.element) {
            this.element.style.opacity = opacity
        }
        return this
    }


    setPointerEvents (value) {
        this.pointerEvents = value
        if (this.element) {
            this.element.style.pointerEvents = value
        }
        return this
    }


    markDirty () {
        this.dirty = true
        return this
    }


    markClean () {
        this.dirty = false
        return this
    }


    mount (container) {
        this.container = container
        if (this.element) {
            container.appendChild(this.element)
        }
        return this
    }


    unmount () {
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element)
        }
        this.container = null
        return this
    }


    resize () {
        return this
    }


    destroy () {
        this.unmount()
        this.element = null
    }

}

