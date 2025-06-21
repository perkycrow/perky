import Manifest from './manifest'
import PerkyModule from './perky_module'
import ModuleRegistry from './module_registry'
import ActionDispatcher from './action_dispatcher'
import ActionController from './action_controller'


export default class Engine extends PerkyModule {

    #modules

    constructor (params = {}) {
        super()

        let {manifest} = params

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

        if (this.initialized) {
            module.init()
        }

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


    get inputManager () {
        return this.actionDispatcher.inputManager
    }


    get inputBinder () {
        return this.actionDispatcher.inputBinder
    }


    bind (bindingData) {
        return this.inputBinder.bind(bindingData)
    }


    unbind (params) {
        return this.inputBinder.unbind(params)
    }


    getBinding (params) {
        return this.inputBinder.getBinding(params)
    }


    hasBinding (params) {
        return this.inputBinder.hasBinding(params)
    }


    getBindingsForInput (params) {
        return this.inputBinder.getBindingsForInput(params)
    }


    getAllBindings () {
        return this.inputBinder.getAllBindings()
    }


    clearBindings () {
        return this.inputBinder.clearBindings()
    }


    isPressed (deviceName, controlName) {
        return this.inputManager.isPressed(deviceName, controlName)
    }


    isPressedAny (controlName) {
        return this.inputManager.isPressedAny(controlName)
    }


    getInputValue (deviceName, controlName) {
        return this.inputManager.getValueFor(deviceName, controlName)
    }


    getInputValueAny (controlName) {
        return this.inputManager.getValueAny(controlName)
    }


    getControl (deviceName, controlName) {
        return this.inputManager.getControl(deviceName, controlName)
    }


    getControlAny (controlName) {
        return this.inputManager.getControlAny(controlName)
    }


    addControl (deviceNameOrControl, ControlOrParams, params) {
        return this.inputManager.addControl(deviceNameOrControl, ControlOrParams, params)
    }


    registerDevice (name, device) {
        return this.inputManager.registerDevice(name, device)
    }


    getDevice (name) {
        return this.inputManager.getDevice(name)
    }


    bindKey (keyName, actionName, eventType = 'pressed') {
        return this.bind({
            deviceName: 'keyboard',
            controlName: keyName,
            actionName,
            eventType
        })
    }


    bindMouse (buttonName, actionName, eventType = 'pressed') {
        return this.bind({
            deviceName: 'mouse',
            controlName: buttonName,
            actionName,
            eventType
        })
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
        const sourceDescriptors = this.manifest.getSourceDescriptors(type)

        return sourceDescriptors ? Object.values(sourceDescriptors) : []
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
