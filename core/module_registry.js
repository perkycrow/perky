import Registry from './registry'


export default class ModuleRegistry extends Registry {

    constructor ({
        registryName,
        parentModule,
        parentModuleName,
        bind = false,
        autoInit = true,
        autoStart = true
    }) {
        super()

        this.parentModule = parentModule
        this.parentModuleName = parentModuleName
        this.registryName = registryName
        this.bind = bind
        this.autoInit = autoInit
        this.autoStart = autoStart

        initEvents(this)
    }


    set (moduleName, module) {
        if (this.has(moduleName)) {
            this.delete(moduleName)
        }

        super.set(moduleName, module)

        module[this.parentModuleName] = this.parentModule

        if (this.bind) {
            this.parentModule[moduleName] = module
        }

        this.parentModule.emit(`${this.registryName}:set`, moduleName, module)
        module.emit('registered', this.parentModule, moduleName)

        handleLifecycleEvents(this, module)
    }

}


function handleLifecycleEvents (registry, module) {
    const {parentModule, autoInit, autoStart} = registry

    if (autoInit && parentModule.initialized) {
        module.init()
    }

    if (autoStart && parentModule.started) {
        module.start()
    }
}


function initEvents (registry) {

    const {parentModule, parentModuleName, registryName} = registry

    registry.on('delete', (moduleName, module) => {
        if (parentModule[moduleName] === module) {
            delete parentModule[moduleName]
        }

        parentModule.emit(`${registryName}:delete`, moduleName, module)
        module.emit('unregistered', parentModule, moduleName)

        delete module[parentModuleName]

        if (typeof module.dispose === 'function') {
            module.dispose()
        }
    })


    registry.on('clear', parentModule.emitter(`${registryName}:clear`))

    parentModule.on('init',  registry.invoker('init'))
    parentModule.on('start', registry.invoker('start'))
    parentModule.on('stop',  registry.invoker('stop'))
    parentModule.on('dispose', () => registry.clear())
}
