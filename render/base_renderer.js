import PerkyModule from '../core/perky_module.js'
import Camera2D from './camera_2d.js'


export default class BaseRenderer extends PerkyModule {

    static $category = 'renderer'

    #resizeObserver = null
    #autoFitEnabled = false

    constructor (options = {}) { // eslint-disable-line complexity
        super(options)

        this.canvas = options.canvas || document.createElement('canvas')
        this.pixelRatio = options.pixelRatio ?? 1
        this.displayWidth = options.width ?? this.canvas.width
        this.displayHeight = options.height ?? this.canvas.height

        this.camera = options.camera ?? new Camera2D({
            viewportWidth: this.displayWidth,
            viewportHeight: this.displayHeight,
            pixelRatio: 1
        })

        if (options.container) {
            this.container = options.container
        }

        if (options.autoFit) {
            this.autoFitEnabled = true
        }
    }


    get container () {
        return this.canvas?.parentElement
    }


    set container (value) {
        if (value) {
            value.appendChild(this.canvas)
            this.#refreshAutoFit()
        }
    }


    get autoFitEnabled () {
        return this.#autoFitEnabled
    }


    set autoFitEnabled (value) {
        if (this.#autoFitEnabled === value) {
            return
        }
        this.#autoFitEnabled = value
        this.#updateAutoFitObserver()
    }


    #updateAutoFitObserver () {
        if (this.#resizeObserver) {
            this.#resizeObserver.disconnect()
            this.#resizeObserver = null
        }

        if (!this.#autoFitEnabled || !this.container) {
            return
        }

        this.#resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const {width, height} = entry.contentRect
                if (width > 0 && height > 0) {
                    this.resize(width, height)
                }
            }
        })

        this.#resizeObserver.observe(this.container)

        const {clientWidth, clientHeight} = this.container
        if (clientWidth > 0 && clientHeight > 0) {
            this.resize(clientWidth, clientHeight)
        }
    }


    #refreshAutoFit () {
        if (this.#autoFitEnabled) {
            this.#updateAutoFitObserver()
        }
    }


    applyPixelRatio () {
        this.canvas.width = this.displayWidth * this.pixelRatio
        this.canvas.height = this.displayHeight * this.pixelRatio

        this.canvas.style.width = `${this.displayWidth}px`
        this.canvas.style.height = `${this.displayHeight}px`

        if (this.camera) {
            this.camera.viewportWidth = this.displayWidth
            this.camera.viewportHeight = this.displayHeight
        }
    }


    setPixelRatio (ratio) {
        this.pixelRatio = ratio
        this.applyPixelRatio()
        return this
    }


    resize (width, height) {
        this.displayWidth = width
        this.displayHeight = height
        this.applyPixelRatio()
        return this
    }


    resizeToContainer () {
        const parent = this.canvas.parentElement
        if (!parent) {
            return this
        }

        const width = parent.clientWidth
        const height = parent.clientHeight

        if (width > 0 && height > 0) {
            return this.resize(width, height)
        }

        return this
    }


    onDispose () {
        this.autoFitEnabled = false

        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas)
        }

        this.canvas = null
        this.camera = null
    }

}
