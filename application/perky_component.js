import {createStyleSheet, adoptStyleSheets} from './dom_utils.js'


const sheetCache = new WeakMap()


export default class PerkyComponent extends HTMLElement {

    #listeners = []

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        this.onInit?.()
    }


    connectedCallback () {
        this.#adoptStyles()
        this.onConnected?.()
    }


    disconnectedCallback () {
        this.#cleanListeners()
        this.onDisconnected?.()
    }


    #adoptStyles () {
        const sheets = this.#collectStyleSheets()
        adoptStyleSheets(this.shadowRoot, ...sheets)
    }


    #collectStyleSheets () {
        const sheets = []
        let proto = this.constructor

        while (proto && proto !== PerkyComponent && proto !== HTMLElement) {
            const protoSheets = this.#getOrCreateSheets(proto)
            if (protoSheets.length > 0) {
                sheets.unshift(...protoSheets)
            }
            proto = Object.getPrototypeOf(proto)
        }

        return sheets
    }


    #getOrCreateSheets (ctor) {
        if (!Object.hasOwn(ctor, 'styles') || !ctor.styles) {
            return []
        }

        if (!sheetCache.has(ctor)) {
            const styles = ctor.styles
            const sheets = Array.isArray(styles)
                ? styles.map(s => this.#toSheet(s))
                : [this.#toSheet(styles)]
            sheetCache.set(ctor, sheets)
        }

        return sheetCache.get(ctor)
    }


    #toSheet (style) {
        if (typeof style === 'string') {
            return createStyleSheet(style)
        }
        return style
    }


    listenTo (target, eventName, callback) {
        target.on(eventName, callback)
        this.#listeners.push({target, eventName, callback})
    }


    #cleanListeners () {
        for (const {target, eventName, callback} of this.#listeners) {
            target.off(eventName, callback)
        }
        this.#listeners = []
    }


    cleanListeners () {
        this.#cleanListeners()
    }

}
