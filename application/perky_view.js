import {uniqueId} from '../core/utils'
import PerkyModule from '../core/perky_module'


export default class PerkyView extends PerkyModule {

    #resizeObserver = null
    #previousStyles = {}
    displayMode = 'normal'

    constructor (params = {}) {
        super()

        this.element = params.element ? params.element : this.constructor.defaultElement(params)

        if (params.container) {
            this.mountTo(params.container)
        }

        if (params.className) {
            this.addClass(params.className)
        }


        this.#setupResizeObserver()
        this.#setupFullscreenEvents()
    }


    get id () {
        return this.element.id
    }


    get parentElement () {
        return this.element.parentElement
    }


    get container () {
        return this.parentElement
    }


    get style () {
        return this.element.style
    }


    get width () {
        return this.element.offsetWidth
    }


    get height () {
        return this.element.offsetHeight
    }


    get boundingRect () {
        return this.element.getBoundingClientRect()
    }


    get position () {
        const {left, top} = this.boundingRect

        return {x: left, y: top}
    }


    get size () {
        return {
            width: this.width,
            height: this.height
        }
    }


    get aspectRatio () {
        const {width, height} = this.size

        return width / height
    }


    classList () {
        return this.element.classList
    }


    addClass (className) {
        this.element.classList.add(className)

        return this
    }


    removeClass (className) {
        this.element.classList.remove(className)

        return this
    }


    toggleClass (className, force) {
        this.element.classList.toggle(className, force)

        return this
    }


    hasClass (className) {
        return this.element.classList.contains(className)
    }


    setSize ({width, height, unit = 'px'}) {
        Object.assign(this.style, {
            width: `${width}${unit}`,
            height: `${height}${unit}`
        })

        this.emit('resize', {width, height})

        return this
    }


    fit (element = this.parentElement) {
        const {width, height} = element.getBoundingClientRect()

        this.setSize({width, height})

        return this
    }


    mountTo (container) {
        if (this.parentElement && this.parentElement !== container) {
            this.parentElement.removeChild(this.element)
        }

        container.appendChild(this.element)

        this.emit('mount', {container})

        if (this.#resizeObserver) {
            this.#resizeObserver.observe(this.element)
        }

        return this
    }


    dismount () {
        if (this.parentElement) {
            this.parentElement.removeChild(this.element)
            this.emit('dismount', {container: this.parentElement})
        }

        if (this.#resizeObserver) {
            this.#resizeObserver.disconnect()
        }

        return this
    }


    get mounted () {
        return Boolean(this.container && this.container.contains(this.element))
    }


    static defaultElement (params) {
        const element = document.createElement('div')

        element.id = params.id || uniqueId('perky_view', 'perky_view')

        element.className = params.className || 'perky-view'

        const styles = {
            display: 'block',
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            height: '100%',
            ...this.defaultStyles(params)
        }

        Object.assign(element.style, styles)

        return element
    }


    static defaultStyles () {
        return {}
    }


    isVisible () {
        return this.element.style.display !== 'none'
    }


    dispose (...args) {
        this.exitFullscreenMode()

        if (this.#resizeObserver) {
            this.#resizeObserver.disconnect()
            this.#resizeObserver = null
        }

        if (this.onFullscreenChange) {
            document.removeEventListener('fullscreenchange', this.onFullscreenChange)
        }

        this.dismount()

        super.dispose(...args)
    }


    setPosition ({x, y, unit = 'px'}) {
        Object.assign(this.style, {
            left: `${x}${unit}`,
            top: `${y}${unit}`
        })
        return this
    }


    setStyle (name, value) {
        if (typeof name === 'object') {
            Object.assign(this.style, name)
            return this
        }

        this.style[name] = value

        return this
    }


    getStyle (name) {
        return this.style[name]
    }


    get zIndex () {
        return this.getStyle('zIndex')
    }


    set zIndex (zIndex) {
        return this.setStyle('zIndex', zIndex)
    }


    get opacity () {
        return this.getStyle('opacity')
    }


    set opacity (opacity) {
        return this.setStyle('opacity', opacity)
    }


    get html () {
        return this.element.innerHTML
    }


    set html (html) {
        this.element.innerHTML = html
        return this
    }


    get text () {
        return this.element.innerText
    }


    set text (text) {
        this.element.innerText = text
        return this
    }


    get display () {
        return this.getStyle('display')
    }


    set display (display) {
        this.setStyle('display', display)
        return this
    }


    hide () {
        if (this.display && this.display !== 'none') {
            this.previousDisplay = this.display
        }

        this.display = 'none'

        return this
    }


    show () {
        if (this.previousDisplay) {
            this.display = this.previousDisplay
            delete this.previousDisplay
        } else {
            this.display = ''
        }

        return this
    }


    setAttribute (name, value) {
        this.element.setAttribute(name, value)
        return this
    }


    getAttribute (name) {
        return this.element.getAttribute(name)
    }


    removeAttribute (name) {
        this.element.removeAttribute(name)
        return this
    }


    setDisplayMode (mode) {
        const modes = {
            normal: () => this.exitFullscreenMode(),
            fullscreen: () => this.enterFullscreenMode()
        }

        if (modes[mode]) {
            return modes[mode]()
        }

        console.warn(`Unknown display mode: ${mode}`)
        return this
    }


    enterFullscreenMode () {
        if (this.displayMode === 'fullscreen') {
            return this
        }

        this.displayMode = 'fullscreen'
        this.fullscreenMode = true

        document.body.classList.add('fullscreen-mode')

        this.#previousStyles = {
            position: this.element.style.position,
            top: this.element.style.top,
            left: this.element.style.left,
            width: this.element.style.width,
            height: this.element.style.height,
            zIndex: this.element.style.zIndex
        }

        Object.assign(this.element.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            zIndex: '10000'
        })

        this.#requestFullscreen()

        return this
    }


    exitFullscreenMode () {
        if (this.displayMode === 'normal') {
            return this
        }

        if (document.fullscreenElement) {
            document.exitFullscreen()
        }

        this.displayMode = 'normal'
        this.fullscreenMode = false

        document.body.style.overflow = ''
        document.body.classList.remove('fullscreen-mode')

        Object.assign(this.element.style, this.#previousStyles)
        this.#previousStyles = {}

        this.#dispatchDisplayModeChanged('normal')

        return this
    }


    #setupResizeObserver () {
        this.#resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const {width, height} = entry.contentRect
                this.emit('resize', {width, height})
            }
        })

        if (this.element) {
            this.#resizeObserver.observe(this.element)
        }
    }


    #setupFullscreenEvents () {
        const onFullscreenChange = () => {
            if (document.fullscreenElement === this.element) {
                this.displayMode = 'fullscreen'
                this.fullscreenMode = true
                document.body.style.overflow = 'hidden'
                this.#dispatchDisplayModeChanged('fullscreen')
            } else if (this.displayMode === 'fullscreen') {
                this.exitFullscreenMode()
            }
        }

        document.addEventListener('fullscreenchange', onFullscreenChange)

        this.onFullscreenChange = onFullscreenChange
    }


    #requestFullscreen () {
        if (this.element.requestFullscreen) {
            this.element.requestFullscreen()
        }
    }


    #dispatchDisplayModeChanged (mode) {
        this.emit('displayMode:changed', {mode})
    }

}
