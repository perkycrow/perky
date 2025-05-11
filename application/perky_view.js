import {uniqueId} from '../core/utils'
import PerkyModule from '../core/perky_module'


export default class PerkyView extends PerkyModule {

    constructor (params = {}) {
        super()

        this.element = params.element ? params.element : this.constructor.defaultElement(params)
        
        initShadowDOM(this, params)

        if (params.container) {
            this.mountTo(params.container)
        }

        if (params.className) {
            this.addClass(params.className)
        }

        setupResizeObserver(this)
    }


    setCss (cssText) {
        const oldStyle = this.shadowRoot.querySelector('style')
        if (oldStyle) {
            oldStyle.remove()
        }

        const style = document.createElement('style')
        style.textContent = cssText
        this.shadowRoot.insertBefore(style, this.shadowContainer)
        
        return this
    }
    

    loadCss (cssPath) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = cssPath
        this.shadowRoot.insertBefore(link, this.shadowContainer)
        
        return this
    }


    get id () {
        return this.element.id
    }


    get parentElement () {
        return this.element.parentElement
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
            width:  this.width,
            height: this.height
        }
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
            width:  `${width}${unit}`,
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
        this.container = container

        this.emit('mount', {container})

        return this
    }


    static defaultElement (params) {
        const element = document.createElement('div')
        
        element.id = params.id || uniqueId('perky_view', 'perky_view')
        
        element.className = params.className || 'perky-view'
        
        const styles = this.defaultStyles(params)
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
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        }

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
        return this.shadowContainer.innerHTML
    }


    set html (html) {
        this.shadowContainer.innerHTML = html
        return this
    }


    get text () {
        return this.shadowContainer.innerText
    }


    set text (text) {
        this.shadowContainer.innerText = text
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

}


function initShadowDOM (perkyView, params) {
    perkyView.shadowRoot = perkyView.element.attachShadow({mode: 'open'})

    perkyView.shadowContainer = document.createElement('div')
    perkyView.shadowContainer.className = 'shadow-container'
    perkyView.shadowRoot.appendChild(perkyView.shadowContainer)

    if (params.css) {
        perkyView.setCss(params.css)
    }

    if (params.cssPath) {
        perkyView.loadCss(params.cssPath)
    }
}


function setupResizeObserver (perkyView) {

    perkyView.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
            const {width, height} = entry.contentRect
            perkyView.emit('resize', {width, height})
        }
    })

    perkyView.resizeObserver.observe(perkyView.element)

}
