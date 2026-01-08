import {createMockGL} from './helpers.js'


global.ResizeObserver = class ResizeObserver {
    constructor (callback) {
        this.callback = callback
    }

    observe (target) {

        this.callback([{
            target,
            contentRect: {
                width: target.clientWidth || 0,
                height: target.clientHeight || 0
            }
        }])
    }

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
