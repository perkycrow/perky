export default class BaseEditorComponent extends HTMLElement {

    #listeners = []

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
    }


    disconnectedCallback () {
        this.cleanListeners()
    }


    listenTo (target, eventName, callback) {
        target.on(eventName, callback)
        this.#listeners.push({target, eventName, callback})
    }


    cleanListeners () {
        for (const {target, eventName, callback} of this.#listeners) {
            target.off(eventName, callback)
        }
        this.#listeners = []
    }

}
