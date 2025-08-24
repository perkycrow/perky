import {LitElement} from 'lit'


export default class PerkyComponent extends LitElement {

    static tagName = 'perky-component'
    static css = ''


    createRenderRoot () {
        return this
    }


    connectedCallback () {
        super.connectedCallback()
        this.constructor.injectStyles()
    }


    disconnectedCallback () {
        super.disconnectedCallback()
        this.constructor.cleanupStyles()
    }


    static injectStyles () {
        const styleId = `${this.tagName}-styles`

        if (document.getElementById(styleId)) {
            this.styleUsageCount = (this.styleUsageCount || 0) + 1
            return
        }

        this.styleUsageCount = 1

        if (!this.css.trim()) {
            return
        }

        const styleSheet = document.createElement('style')
        styleSheet.id = styleId
        styleSheet.textContent = this.css
        document.head.appendChild(styleSheet)
    }


    static cleanupStyles () {
        const styleId = `${this.tagName}-styles`
        this.styleUsageCount = (this.styleUsageCount || 1) - 1

        if (this.styleUsageCount <= 0) {
            const styleElement = document.getElementById(styleId)
            if (styleElement) {
                styleElement.remove()
            }
            this.styleUsageCount = 0
        }
    }


    static define () {
        if (!customElements.get(this.tagName)) {
            customElements.define(this.tagName, this)
        }
        return this
    }

}
