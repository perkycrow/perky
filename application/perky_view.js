import {uniqueId} from '../core/utils'
import PerkyModule from '../core/perky_module'


export default class PerkyView extends PerkyModule {

    #resizeObserver = null
    #previousStyles = {}
    #onFullscreenChange = null
    displayMode = 'normal'

    constructor (params = {}) {
        super(params)

        this.element = params.element ? params.element : this.constructor.defaultElement(params)

        if (params.container) {
            this.mount(params.container)
        }

        if (params.className) {
            this.addClass(params.className)
        }


        this.#setupResizeObserver()
        this.#setupFullscreenEvents()
    }


    onInstall (host) {
        host.delegate(this, [
            'element',
            'mount',
            'dismount',
            'mounted',
            'displayMode',
            'setDisplayMode',
            'html',
            'enterFullscreenMode',
            'exitFullscreenMode',
            'toggleFullscreen'
        ])

        host.delegateEvents(this, [
            'resize',
            'mount',
            'dismount',
            'displayMode:changed'
        ])
    }


    get container () {
        return this.element.parentElement
    }


    get width () {
        return this.element.offsetWidth
    }


    get height () {
        return this.element.offsetHeight
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


    addClass (className) {
        this.element.classList.add(className)
    }


    removeClass (className) {
        this.element.classList.remove(className)
    }


    hasClass (className) {
        return this.element.classList.contains(className)
    }


    setSize ({width, height, unit = 'px'}) {
        Object.assign(this.element.style, {
            width: `${width}${unit}`,
            height: `${height}${unit}`
        })

        this.emit('resize', {width, height})
    }


    fit (element = this.container) {
        const {width, height} = element.getBoundingClientRect()

        this.setSize({width, height})
    }


    mount (container) {
        if (this.parentElement && this.parentElement !== container) {
            this.parentElement.removeChild(this.element)
        }

        container.appendChild(this.element)

        console.log('PerkyView mounted:', {
            container,
            containerClientWidth: container.clientWidth,
            containerClientHeight: container.clientHeight,
            elementClientWidth: this.element.clientWidth,
            elementClientHeight: this.element.clientHeight,
            elementWidth: this.width,
            elementHeight: this.height
        })

        this.emit('mount', {container})

        if (this.#resizeObserver) {
            this.#resizeObserver.observe(this.element)
        }
    }


    dismount () {
        if (this.parentElement) {
            this.parentElement.removeChild(this.element)
            this.emit('dismount', {container: this.parentElement})
        }

        if (this.#resizeObserver) {
            this.#resizeObserver.disconnect()
        }
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


    dispose () {
        this.exitFullscreenMode()

        if (this.#resizeObserver) {
            this.#resizeObserver.disconnect()
            this.#resizeObserver = null
        }

        if (this.#onFullscreenChange) {
            document.removeEventListener('fullscreenchange', this.#onFullscreenChange)
        }

        this.dismount()
    }


    get html () {
        return this.element.innerHTML
    }


    set html (html) {
        this.element.innerHTML = html
    }


    get display () {
        return this.element.style.display
    }


    set display (display) {
        this.element.style.display = display
    }


    hide () {
        if (this.display && this.display !== 'none') {
            this.previousDisplay = this.display
        }

        this.display = 'none'
    }


    show () {
        if (this.previousDisplay) {
            this.display = this.previousDisplay
            delete this.previousDisplay
        } else {
            this.display = ''
        }
    }


    setDisplayMode (mode) {
        const modes = {
            normal: () => this.exitFullscreenMode(),
            fullscreen: () => this.enterFullscreenMode()
        }

        if (modes[mode]) {
            modes[mode]()
        }
    }


    enterFullscreenMode () {
        if (this.displayMode === 'fullscreen') {
            return
        }

        this.displayMode = 'fullscreen'

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
    }


    exitFullscreenMode () {
        if (this.displayMode === 'normal') {
            return
        }

        if (document.fullscreenElement) {
            document.exitFullscreen()
        }

        this.displayMode = 'normal'

        document.body.style.overflow = ''
        document.body.classList.remove('fullscreen-mode')

        Object.assign(this.element.style, this.#previousStyles)
        this.#previousStyles = {}

        this.#dispatchDisplayModeChanged('normal')
    }


    toggleFullscreen () {
        const mode = this.displayMode

        if (mode === 'fullscreen') {
            this.exitFullscreenMode()
        } else {
            this.enterFullscreenMode()
        }
    }


    #setupResizeObserver () {
        this.#resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const {width, height} = entry.contentRect

                if (this.mounted) {
                    this.emit('resize', {width, height})
                }
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
                document.body.style.overflow = 'hidden'
                this.#dispatchDisplayModeChanged('fullscreen')
            } else if (this.displayMode === 'fullscreen') {
                this.exitFullscreenMode()
            }
        }

        document.addEventListener('fullscreenchange', onFullscreenChange)

        this.#onFullscreenChange = onFullscreenChange
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
