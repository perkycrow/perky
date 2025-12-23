import PerkyModule from '../core/perky_module'


export default class Layer extends PerkyModule {

    static $category = 'layer'

    constructor (options = {}) {
        super(options)

        this.zIndex = options.zIndex ?? 0
        this.visible = options.visible ?? true
        this.opacity = options.opacity ?? 1
        this.pointerEvents = options.pointerEvents ?? 'auto'
        this.dirty = true

        this.element = null
        this.container = null

        this.viewport = options.viewport ?? {
            x: 0,
            y: 0,
            width: '100%',
            height: '100%',
            anchor: 'top-left'
        }

        this.resolvedViewport = {x: 0, y: 0, width: 0, height: 0}
    }


    calculateViewport (containerWidth, containerHeight) { // eslint-disable-line complexity
        const vp = this.viewport

        const width = typeof vp.width === 'string' && vp.width.endsWith('%')
            ? (parseFloat(vp.width) / 100) * containerWidth
            : parseFloat(vp.width)

        const height = typeof vp.height === 'string' && vp.height.endsWith('%')
            ? (parseFloat(vp.height) / 100) * containerHeight
            : parseFloat(vp.height)

        let x = typeof vp.x === 'string' && vp.x.endsWith('%')
            ? (parseFloat(vp.x) / 100) * containerWidth
            : parseFloat(vp.x)

        let y = typeof vp.y === 'string' && vp.y.endsWith('%')
            ? (parseFloat(vp.y) / 100) * containerHeight
            : parseFloat(vp.y)

        const anchor = vp.anchor || 'top-left'
        if (anchor.includes('right')) {
            x = containerWidth - width - x
        }
        if (anchor.includes('bottom')) {
            y = containerHeight - height - y
        }

        this.resolvedViewport.x = x
        this.resolvedViewport.y = y
        this.resolvedViewport.width = width
        this.resolvedViewport.height = height

        return this.resolvedViewport
    }


    applyViewport () {
        if (!this.element) {
            return this
        }

        const vp = this.resolvedViewport

        this.element.style.left = `${vp.x}px`
        this.element.style.top = `${vp.y}px`
        this.element.style.width = `${vp.width}px`
        this.element.style.height = `${vp.height}px`

        return this
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


    resize (width, height) {
        this.calculateViewport(width, height)
        this.applyViewport()
        return this
    }


    onDispose () {
        this.unmount()
        this.element = null
    }

}
