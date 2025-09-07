import Registry from '../core/registry'
import ModuleRegistry from '../core/module_registry'
import PerkyModule from '../core/perky_module'


export default class ApplicationManager extends PerkyModule {

    constructor () {
        super()

        this.constructors = new Registry()

        this.instances = new ModuleRegistry({
            parentModule: this,
            parentModuleName: 'appManager',
            registryName: 'applications',
            bind: false,
            autoStart: false
        })

        this.lastAppId = 0
    }


    register (name, Application) {
        if (this.constructors.has(name)) {
            throw new Error(`Application "${name}" is already registered.`)
        }

        this.constructors.set(name, Application)
    }


    unregister (name) {
        if (this.constructors.has(name)) {
            this.constructors.delete(name)
        }
    }


    create (name, params = {}) {
        if (!this.constructors.has(name)) {
            throw new Error(`Application "${name}" is not registered.`)
        }

        const Application = this.constructors.get(name)
        const app = new Application(params)
        app.id = ++this.lastAppId
        this.instances.set(app.id, app)

        return app
    }


    async spawn (name, params = {}) {
        const app = this.create(name, params)
        await app.preload()
        if (params.container) {
            app.mountTo(params.container)
        }
        app.start()
        return app
    }


    start (appId) {
        if (this.instances.has(appId)) {
            const app = this.instances.get(appId)
            app.start()
        }
    }


    stop (appId) {
        if (this.instances.has(appId)) {
            const app = this.instances.get(appId)
            app.stop()
        }
    }


    execute (appId, method, ...args) {
        if (this.instances.has(appId)) {
            const app = this.instances.get(appId)
            app.dispatchAction(method, ...args)
        }
    }


    dispose (appId) {
        if (this.instances.has(appId)) {
            const app = this.instances.get(appId)
            app.dispose()
            this.instances.delete(appId)
        }
    }


    list (grep = null) {
        const apps = []
        this.instances.forEach((app) => {
            apps.push(app)
        })

        if (grep) {
            return apps.filter(app => app.name.includes(grep))
        }

        return apps
    }

}
