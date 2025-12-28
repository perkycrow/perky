import Registry from '../core/registry'
import PerkyModule from '../core/perky_module'


export default class ApplicationManager extends PerkyModule {

    constructors = new Registry()

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


    createApp (name, params = {}) {
        if (!this.constructors.has(name)) {
            throw new Error(`Application "${name}" is not registered.`)
        }

        const Application = this.constructors.get(name)

        const options = {
            ...params,
            $category: 'application'
        }

        return this.create(Application, options)
    }


    async spawn (name, params = {}) {
        const {preload = true, ...appParams} = params
        const app = this.createApp(name, appParams)

        if (preload === 'all') {
            await app.loadAll()
        } else if (preload === true) {
            await app.preload()
        }

        if (params.container) {
            app.mount(params.container)
        }

        app.start()
        return app
    }


    startApp (nameOrId) {
        const app = this.#findApp(nameOrId)
        if (app) {
            app.start()
        }
    }


    stopApp (nameOrId) {
        const app = this.#findApp(nameOrId)
        if (app) {
            app.stop()
        }
    }


    execute (nameOrId, method, ...args) {
        const app = this.#findApp(nameOrId)
        if (app) {
            app.execute(method, ...args)
        }
    }


    disposeApp (nameOrId) {
        const app = this.#findApp(nameOrId)
        if (app) {
            this.removeChild(app.$id)
        }
    }


    list (grep = null) {
        const apps = this.children

        if (grep) {
            return apps.filter(app => app.$name && app.$name.includes(grep))
        }

        return apps
    }


    #findApp (nameOrId) {
        let app = this.getChild(nameOrId)

        if (!app) {
            app = this.children.find(child => child.$id === nameOrId)
        }

        return app || null
    }

}
