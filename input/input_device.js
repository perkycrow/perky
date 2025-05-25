import PerkyModule from '../core/perky_module'


const cache = new Map()

export default class InputDevice extends PerkyModule {

    static methods = []
    static events = []


    constructor ({container = window, name} = {}) {
        super()

        this.container = container
        this.name      = name || this.constructor.name
        this.controls = new Map()
        
        this.createControls()
    }


    get methods () {
        return fetchInheritedArray(this, 'methods')
    }


    get events () {
        return fetchInheritedArray(this, 'events')
    }


    start () {
        return super.start() && this.observe()
    }


    stop () {
        return super.stop() && this.unobserve()
    }


    isPressed () { // eslint-disable-line class-methods-use-this
        // Abstract method to be implemented in subclasses
        return false
    }


    observe () { // eslint-disable-line class-methods-use-this
        // Abstract method to be implemented in subclasses
        return true
    }


    unobserve () { // eslint-disable-line class-methods-use-this
        // Abstract method to be implemented in subclasses
        return true
    }


    createControls () { // eslint-disable-line class-methods-use-this
        // To be implemented in subclasses
    }


    getControl (name) {
        return this.controls.get(name)
    }


    getAllControls () {
        return Array.from(this.controls.values())
    }


    addControl (name, control) {
        this.controls.set(name, control)
        return control
    }


    removeControl (name) {
        const control = this.controls.get(name)
        if (control) {
            this.controls.delete(name)
        }
        return control
    }


    static clearCache () {
        cache.clear()
    }

}


function addUniqueItems (result, items) {
    for (const item of items) {
        if (!result.includes(item)) {
            result.push(item)
        }
    }
}


function fetchInheritedArray (instance, property) {
    const constructor = instance.constructor
    const cacheKey = constructor.name + '_' + property

    if (!cache.has(cacheKey)) {
        const result = []
        let currentProto = constructor
        
        while (currentProto && currentProto[property]) {
            addUniqueItems(result, currentProto[property])
            currentProto = Object.getPrototypeOf(currentProto)
        }
        
        cache.set(cacheKey, result)
    }
    
    return cache.get(cacheKey)
}
