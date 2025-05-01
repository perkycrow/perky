import ActiveModule from './active_module'


export default class ActiveService extends ActiveModule {

    static shortcuts = []

    constructor () {
        super()
        this.shortcuts = new Map()

        this.on('registered',   install(this))
        this.on('unregistered', uninstall(this))
    }

}


function parseShortcut (shortcut) {
    if (typeof shortcut === 'string') {
        return {
            shortcutName: shortcut,
            methodName:   shortcut
        }
    }

    if (typeof shortcut === 'object') {
        const shortcutName = Object.keys(shortcut)[0]
        return {shortcutName, methodName: shortcut[shortcutName]}
    }

    return null
}


function installShortcut (service, engine, shortcut) {
    const parsed = parseShortcut(shortcut)

    if (!parsed) {
        console.warn('Invalid shortcut definition:', shortcut)
        return
    }

    const {shortcutName, methodName} = parsed

    if (typeof service[methodName] !== 'function') {
        console.warn(`Cannot install shortcut "${shortcutName}". Method "${methodName}" does not exist.`)
        return
    }

    if (engine.hasOwnProperty(shortcutName) || shortcutName in engine) {
        console.warn(`Cannot install shortcut "${shortcutName}". Name collision.`)
        return
    }

    const method = service[methodName].bind(service)
    service.shortcuts.set(shortcutName, method)

    Object.defineProperty(engine, shortcutName, {
        value: method,
        writable: false,
        configurable: true
    })
}


function install (service) {
    return function (engine) {
        if (typeof service.install === 'function') {
            service.install(engine)
        }

        const shortcuts = service.constructor.shortcuts || []
        shortcuts.forEach(shortcut => installShortcut(service, engine, shortcut))
    }
}


function uninstall (service) {
    return function (engine) {
        if (typeof service.uninstall === 'function') {
            service.uninstall(engine)
        }

        service.shortcuts.forEach((value, shortcutName) => {
            if (engine.hasOwnProperty(shortcutName)) {
                delete engine[shortcutName]
            }
        })

        service.shortcuts.clear()
    }
}
