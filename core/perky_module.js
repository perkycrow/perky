import Notifier from './notifier'


export default class PerkyModule extends Notifier {

    constructor () {
        super()
        reset(this)
    }


    get running () {
        return this.initialized && this.started && !this.paused
    }


    init (...args) {
        if (this.initialized) {
            return false
        }

        this.initialized = true
        this.emit('init', ...args)

        return true
    }


    update (...args) {
        if (!this.running) {
            return false
        }

        this.emit('update', ...args)

        return true
    }


    start (...args) {
        if (!this.initialized || this.started) {
            return false
        }

        this.paused = false
        this.started = true
        this.emit('start', ...args)

        return true
    }


    stop (...args) {
        if (!this.initialized || !this.started) {
            return false
        }

        this.started = false
        this.emit('stop', ...args)

        return true
    }


    pause (...args) {
        if (!this.running) {
            return false
        }

        this.paused = true
        this.emit('pause', ...args)

        return true
    }


    resume (...args) {
        if (!this.initialized || !this.started || !this.paused) {
            return false
        }

        this.paused = false
        this.emit('resume', ...args)

        return true
    }


    dispose (...args) {
        if (!this.initialized) {
            return false
        }

        this.stop()
        this.emit('dispose', ...args)
        this.removeListeners()
        reset(this)

        return true
    }

    static initRegistryEvents (params) {
        initRegistryEvents(params)
    }

}


function reset (module) {
    module.started = false
    module.initialized = false
    module.paused = false
}




function initRegistryEvents ({module, moduleName, registryName, registry, bind = false}) {

    registry.on('delete', (name, item) => {
        if (typeof item.dispose === 'function') {
            item.dispose()
        }
    })

    registry.on('set', (key, item) => {
        onSetRegistryItem({module, moduleName, registryName, key, item, bind})
    })

    registry.on('delete', (key, item) => {
        onDeleteRegistryItem({module, moduleName, registryName, key, item, bind})
    })

    registry.on('clear', () => {
        module.emit(`${registryName}:clear`)
    })

    module.on('init',   registry.invoker('init'))
    module.on('start',  registry.invoker('start'))
    module.on('stop',   registry.invoker('stop'))
    module.on('update', registry.invoker('update'))
    module.on('pause',  registry.invoker('pause'))
    module.on('resume', registry.invoker('resume'))
}


function onSetRegistryItem ({module, moduleName, registryName, key, item, bind}) {
    if (moduleName in item) {
        console.warn(`[${registryName}] ${key} is already registered in another module`)
        return
    }

    item[moduleName] = module

    if (bind) {
        module[key] = item
    }

    module.emit(`${registryName}:set`, key, item)
    item.emit('registered', module, key)
}


function onDeleteRegistryItem ({module, moduleName, registryName, key, item}) {
    if (item[moduleName] !== module) {
        console.warn(`[${registryName}] ${key} is not registered in this module`)
        return
    }

    if (module[key] === item) {
        delete module[key]
    }

    module.emit(`${registryName}:delete`, key, item)
    item.emit('unregistered', module, key)

    delete item[moduleName]
}
