
global.ResizeObserver = class ResizeObserver {
    constructor (callback) {
        this.callback = callback
    }

    observe () { } // eslint-disable-line class-methods-use-this

    unobserve () { } // eslint-disable-line class-methods-use-this

    disconnect () { } // eslint-disable-line class-methods-use-this
}
