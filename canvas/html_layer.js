import Layer from './layer'


export default class HTMLLayer extends Layer {

    constructor (name, options = {}) {
        super(name, options)
        
        this.div = document.createElement('div')
        this.element = this.div
        
        this.applyStyles()
        
        if (options.content) {
            this.setContent(options.content)
        }
        
        if (options.className) {
            this.div.className = options.className
        }
    }


    applyStyles () {
        this.div.style.position = 'absolute'
        this.div.style.top = '0'
        this.div.style.left = '0'
        this.div.style.width = '100%'
        this.div.style.height = '100%'
        this.div.style.zIndex = this.zIndex
        this.div.style.opacity = this.opacity
        this.div.style.pointerEvents = this.pointerEvents
        this.div.style.display = this.visible ? 'block' : 'none'
    }


    setContent (content) {
        if (typeof content === 'string') {
            this.div.innerHTML = content
        } else if (content instanceof HTMLElement) {
            this.div.innerHTML = ''
            this.div.appendChild(content)
        }
        return this
    }


    addClass (className) {
        this.div.classList.add(className)
        return this
    }


    removeClass (className) {
        this.div.classList.remove(className)
        return this
    }


    setStyle (property, value) {
        this.div.style[property] = value
        return this
    }


    resize (width, height) {
        this.div.style.width = `${width}px`
        this.div.style.height = `${height}px`
        return this
    }

}

