import Manifest from './manifest'
import PerkyModule from './perky_module'
import Registry from './registry'
import ActionDispatcher from './action_dispatcher'
import ActionController from './action_controller'


export default class Engine extends PerkyModule {

    constructor (manifest = {}) {
        super()

        if (!(manifest instanceof Manifest)) {
            manifest = new Manifest(manifest)
        }

        this.manifest = manifest
        this.modules  = new Registry()

        initEvents(this)

        this.registerModule('actionDispatcher', new ActionDispatcher())

        const applicationController = new ActionController()
        this.registerController('application', applicationController)
        this.setActiveController('application')
    }


    registerModule (name, module) {
        if (!(module instanceof PerkyModule)) {
            console.warn(`Attempted to register non-module object as module: ${name}`)
            return false
        }

        return this.modules.set(name, module)
    }


    getModule (name) {
        return this.modules.get(name) || null
    }


    removeModule (name) {
        if (this.modules.has(name)) {
            return this.modules.delete(name)
        }

        return false
    }


    registerController (name, controller) {
        return this.actionDispatcher.register(name, controller)
    }


    getController (name) {
        return this.actionDispatcher.getController(name) || null
    }


    removeController (name) {
        return this.actionDispatcher.unregister(name)
    }


    setActiveController (name) {
        return this.actionDispatcher.setActive(name)
    }


    getMetadata (key) {
        return this.manifest.metadata(key)
    }


    setMetadata (key, value) {
        this.manifest.metadata(key, value)
        return this
    }


    getConfig (path) {
        return this.manifest.config(path)
    }


    setConfig (path, value) {
        this.manifest.config(path, value)

        return this
    }


    addSource (type, source) {
        return this.manifest.addSource(type, source)
    }


    getSource (type, id) {
        const sources = this.manifest.data.sources[type]
        return sources && sources[id] ? sources[id] : null
    }


    getSources (type) {
        const sources = this.manifest.getSources(type)

        return sources ? Object.values(sources) : []
    }


    addAlias (key, value) {
        return this.manifest.alias(key, value)
    }


    getAlias (key) {
        return this.manifest.alias(key)
    }


    exportManifest (pretty = true) {
        return this.manifest.export(pretty)
    }


    importManifest (data) {
        return this.manifest.import(data)
    }

}



function initEvents (engine) {

    PerkyModule.initRegistryEvents({
        module: engine,
        moduleName: 'engine',
        registry: engine.modules,
        registryName: 'module',
        bind: true
    })

}
