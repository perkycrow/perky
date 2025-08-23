import Registry from './registry'


export default class ModuleRegistry extends Registry {

    #parentModule
    #parentModuleName
    #registryName
    #bind
    #autoStart

    constructor ({
        registryName,
        parentModule,
        parentModuleName,
        bind = false,
        autoStart = true
    }) {
        super()

        this.#parentModule = parentModule
        this.#parentModuleName = parentModuleName
        this.#registryName = registryName
        this.#bind = bind
        this.#autoStart = autoStart

        this.#initEvents()
    }


    set (moduleName, module) {
        if (this.has(moduleName)) {
            this.delete(moduleName)
        }

        super.set(moduleName, module)

        module[this.#parentModuleName] = this.#parentModule

        if (this.#bind) {
            this.#parentModule[moduleName] = module
        }

        this.#parentModule.emit(`${this.#registryName}:set`, moduleName, module)
        module.emit('registered', this.#parentModule, moduleName)

        this.#handleLifecycleEvents(module)
    }


    get registryName () {
        return this.#registryName
    }


    #handleLifecycleEvents (module) {
        if (this.#autoStart && this.#parentModule.started) {
            module.start()
        }
    }


    #initEvents () {
        this.on('delete', (moduleName, module) => {
            if (this.#parentModule[moduleName] === module) {
                delete this.#parentModule[moduleName]
            }

            this.#parentModule.emit(`${this.#registryName}:delete`, moduleName, module)
            module.emit('unregistered', this.#parentModule, moduleName)

            delete module[this.#parentModuleName]

            if (typeof module.dispose === 'function') {
                module.dispose()
            }
        })

        this.on('clear', this.#parentModule.emitter(`${this.#registryName}:clear`))

        this.#parentModule.on('start', this.invoker('start'))
        this.#parentModule.on('stop',  this.invoker('stop'))
        this.#parentModule.on('dispose', () => this.clear())
    }


    getConfig () {
        return {
            parentModule: this.#parentModule,
            parentModuleName: this.#parentModuleName,
            registryName: this.#registryName,
            bind: this.#bind,
            autoStart: this.#autoStart
        }
    }

}
