import {LitElement, html, css} from 'lit'
import {uniqueId} from '../core/utils'


export default class PerkyElement extends LitElement {

    #previousStyles = {}
    #resizeObserver = null

    static properties = {
        displayMode: {type: String, reflect: true},
        fullscreenMode: {type: Boolean, reflect: true}
    }

    static styles = css`
        :host {
            display: block;
            overflow: hidden;
            position: relative;
            width: 100%;
            height: 100%;
        }

        :host([fullscreen-mode]) {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 10000 !important;
        }

        .perky-element-content {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        :host([fullscreen-mode]) ~ body {
            overflow: hidden;
        }
    `


    constructor () {
        super()
        
        this.displayMode = 'normal'
        this.fullscreenMode = false
        
        this.id = this.id || uniqueId('perky_element', 'perky_element')
        
        this.#setupResizeObserver()
        this.#setupFullscreenEvents()
    }


    render () { // eslint-disable-line class-methods-use-this
        return html`
            <div class="perky-element-content">
                <slot></slot>
            </div>
        `
    }


    connectedCallback () {
        super.connectedCallback()
        
        if (this.#resizeObserver) {
            this.#resizeObserver.observe(this)
        }
    }


    disconnectedCallback () {
        super.disconnectedCallback()
        
        if (this.#resizeObserver) {
            this.#resizeObserver.disconnect()
        }
        
        this.exitFullscreenMode()
    }


    get width () {
        return this.offsetWidth
    }


    get height () {
        return this.offsetHeight
    }


    get boundingRect () {
        return this.getBoundingClientRect()
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
        
        this.#dispatchDisplayModeChanged('normal')
        
        return this
    }


    #setupResizeObserver () {
        this.#resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const {width, height} = entry.contentRect
                this.#dispatchResize(width, height)
            }
        })
    }


    #setupFullscreenEvents () {
        const onFullscreenChange = () => {
            if (document.fullscreenElement === this) {
                this.displayMode = 'fullscreen'
                this.fullscreenMode = true
                document.body.style.overflow = 'hidden'
                this.#dispatchDisplayModeChanged('fullscreen')
            } else if (this.displayMode === 'fullscreen') {
                this.displayMode = 'normal'
                this.fullscreenMode = false
                document.body.style.overflow = ''
                this.#dispatchDisplayModeChanged('normal')
            }
        }

        document.addEventListener('fullscreenchange', onFullscreenChange)
    }


    #requestFullscreen () {
        if (this.requestFullscreen) {
            this.requestFullscreen()
        }
    }


    #dispatchResize (width, height) {
        this.dispatchEvent(new CustomEvent('resize', {
            detail: {width, height},
            bubbles: true
        }))
    }


    #dispatchDisplayModeChanged (mode) {
        this.dispatchEvent(new CustomEvent('displayMode:changed', {
            detail: {mode},
            bubbles: true
        }))
    }

}

customElements.define('perky-element', PerkyElement)
