import {createMockGL} from './helpers.js'


global.ResizeObserver = class ResizeObserver {
    constructor (callback) {
        this.callback = callback
    }

    observe () { }

    unobserve () { }

    disconnect () { }
}


global.createMockWebGLContext = createMockGL

const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function (type, options) {
    if (type === 'webgl' || type === 'webgl2') {
        return global.createMockWebGLContext()
    }
    return originalGetContext.call(this, type, options)
}
