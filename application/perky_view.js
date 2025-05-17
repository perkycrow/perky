import {uniqueId} from '../core/utils'
import PerkyModule from '../core/perky_module'


export default class PerkyView extends PerkyModule {

    constructor (params = {}) {
        super()

        this.host = params.element ? params.element : this.constructor.defaultElement(params)

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
        this.shadowRoot.insertBefore(style, this.element)
        
        return this
    }


    getCss () {
        const style = this.shadowRoot.querySelector('style')

        return style && style.textContent
    }


    appendCss (cssText) {
        const oldStyle = this.getCss()

        const newStyle = oldStyle ? `${oldStyle}\n${cssText}` : cssText
        this.setCss(newStyle)

        return this
    }


    loadCss (cssPath) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = cssPath
        this.shadowRoot.insertBefore(link, this.element)
        
        return this
    }


    get id () {
        return this.host.id
    }


    get parentElement () {
        return this.host.parentElement
    }


    get hostStyle () {
        return this.host.style
    }


    get width () {
        return this.host.offsetWidth
    }


    get height () {
        return this.host.offsetHeight
    }


    get boundingRect () {
        return this.host.getBoundingClientRect()
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


    get aspectRatio () {
        const {width, height} = this.size

        return width / height
    }


    classList () {
        return this.host.classList
    }


    addClass (className) {
        this.host.classList.add(className)

        return this
    }


    removeClass (className) {
        this.host.classList.remove(className)

        return this
    }


    toggleClass (className, force) {
        this.host.classList.toggle(className, force)

        return this
    }


    hasClass (className) {
        return this.host.classList.contains(className)
    }


    setSize ({width, height, unit = 'px'}) {
        Object.assign(this.hostStyle, {
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
            this.parentElement.removeChild(this.host)
        }

        container.appendChild(this.host)
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
        return this.host.style.display !== 'none'
    }


    dispose (...args) {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        }

        super.dispose(...args)
    }


    setPosition ({x, y, unit = 'px'}) {
        Object.assign(this.hostStyle, {
            left: `${x}${unit}`,
            top: `${y}${unit}`
        })
        return this
    }


    setStyle (name, value) {
        if (typeof name === 'object') {
            Object.assign(this.hostStyle, name)
            return this
        }

        this.hostStyle[name] = value

        return this
    }


    getStyle (name) {
        return this.hostStyle[name]
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
        this.host.setAttribute(name, value)
        return this
    }


    getAttribute (name) {
        return this.host.getAttribute(name)
    }


    removeAttribute (name) {
        this.host.removeAttribute(name)
        return this
    }

}


function initShadowDOM (perkyView, params) {
    perkyView.shadowRoot = perkyView.host.attachShadow({mode: 'open'})

    perkyView.element = document.createElement('div')
    perkyView.element.className = 'shadow-container'
    perkyView.shadowRoot.appendChild(perkyView.element)
    perkyView.element.style.height = '100%'

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

    perkyView.resizeObserver.observe(perkyView.host)

}
