import PerkyModule from '../core/perky_module'


export default class InputDevice extends PerkyModule {

    static methods = []
    static controls = []
    static events = []
    static cache = {}


    constructor ({container = window, name} = {}) {
        super()

        this.container = container
        this.name      = name || this.constructor.name
    }


    get controls () {
        return fetchInheritedArray(this, 'controls')
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


    observe () { // eslint-disable-line class-methods-use-this
        // Abstract method to be implemented in subclasses
        return true
    }


    unobserve () { // eslint-disable-line class-methods-use-this
        // Abstract method to be implemented in subclasses
        return true
    }

}


function fetchInheritedArray (instance, property) {
    const constructor = instance.constructor
    
    if (!constructor.cache[property]) {
        const uniqueItems = new Set()
        let currentProto = constructor
        
        while (currentProto && currentProto[property]) {
            currentProto[property].forEach(item => uniqueItems.add(item))
            currentProto = Object.getPrototypeOf(currentProto)
        }

        constructor.cache[property] = Array.from(uniqueItems)
    }
    
    return constructor.cache[property]
}