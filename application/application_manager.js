import Registry from '../core/registry'
import PerkyModule from '../core/perky_module'


export default class ApplicationManager extends PerkyModule {

    constructor () {
        super()

        this.constructors = new Registry()
        this.instances = new Registry()
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
        app.host = this
        this.instances.set(app.id, app)

        app.once('dispose', () => {
            if (this.instances.get(app.id) === app) {
                this.instances.delete(app.id)
                this.emit('applications:delete', app.id, app)
                app.emit('unregistered', this, app.id)
            }
        })

        this.emit('applications:set', app.id, app)
        app.emit('registered', this, app.id)

        return app
    }


    async spawn (name, params = {}) {
        const app = this.create(name, params)
        await app.preload()
        if (params.container) {
            app.mount(params.container)
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
            app.execute(method, ...args)
        }
    }


    dispose (appId) {
        if (this.instances.has(appId)) {
            const app = this.instances.get(appId)
            this.instances.delete(appId)

            this.emit('applications:delete', appId, app)
            app.emit('unregistered', this, appId)
            app.dispose()
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
