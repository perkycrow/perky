import PerkyModule from './perky_module'
import Manifest from './manifest'
import ModuleRegistry from './module_registry'
import ActionDispatcher from './action_dispatcher'
import ActionController from './action_controller'


export default class Engine extends PerkyModule {

    #modules = null

    constructor (params = {}) {
        let {manifest = {}} = params

        super()

        if (!(manifest instanceof Manifest)) {
            manifest = new Manifest(manifest)
        }

        this.manifest = manifest
        this.#modules = new ModuleRegistry({
            registryName: 'module',
            parentModule: this,
            parentModuleName: 'engine',
            bind: true
        })

        this.registerModule('actionDispatcher', new ActionDispatcher())

        this.applicationController = new ActionController()
        this.registerController('application', this.applicationController)
        this.setActiveController('application')
    }


    registerModule (name, module) {
        if (!(module instanceof PerkyModule)) {
            console.warn(`Attempted to register non-module object as module: ${name}`)
            return false
        }

        const result = this.#modules.set(name, module)

        if (this.started) {
            module.start()
        }

        return result
    }


    getModule (name) {
        return this.#modules.get(name)
    }


    removeModule (name) {
        if (this.#modules.has(name)) {
            return this.#modules.delete(name)
        }

        return false
    }


    registerController (name, controller) {
        return this.actionDispatcher.register(name, controller)
    }


    getController (name) {
        return this.actionDispatcher.getController(name) || null
    }


    unregisterController (name) {
        return this.actionDispatcher.unregister(name)
    }


    setActiveController (name) {
        return this.actionDispatcher.setActive(name)
    }


    getActiveController () {
        return this.actionDispatcher.getActive()
    }


    addAction (actionName, action) {
        return this.applicationController.addAction(actionName, action)
    }


    dispatchAction (actionName, ...args) {
        return this.actionDispatcher.dispatch(actionName, ...args)
    }


    eventToAction (eventName, actionName, ...args) {
        return this.on(eventName, this.actionCaller(actionName, ...args))
    }


    onceToAction (eventName, actionName, ...args) {
        return this.once(eventName, this.actionCaller(actionName, ...args))
    }


    actionCaller (actionName, ...args) {
        return () => this.dispatchAction(actionName, ...args)
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


    addSourceDescriptor (type, sourceDescriptor) {
        return this.manifest.addSourceDescriptor(type, sourceDescriptor)
    }


    getSourceDescriptor (type, id) {
        return this.manifest.getSourceDescriptor(type, id)
    }


    getSourceDescriptors (type) {
        return this.manifest.getSourceDescriptorsByType(type)
    }


    getSource (type, id) {
        return this.manifest.getSource(type, id)
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
