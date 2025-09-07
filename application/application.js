import Engine from '../core/engine'
import Registry from '../core/registry'
import PerkyView from './perky_view'
import SourceManager from './source_manager'
import PluginRegistry from '../core/plugin_registry'
import {loaders} from './loaders'
import InputBinder from '../input/input_binder'
import InputManager from '../input/input_manager'
import KeyboardDevice from '../input/input_devices/keyboard_device'
import MouseDevice from '../input/input_devices/mouse_device'


export default class Application extends Engine {

    #plugins = null

    constructor (params = {}) {
        const {plugins = [], inputManager, inputBinder, keyboard = {}, mouse = {}} = params
        
        super(params)

        this.loaders = new Registry(loaders)
        this.#plugins = new PluginRegistry(this)

        this.registerModule('perkyView', new PerkyView({className: 'perky-application'}))
        this.registerModule('sourceManager', new SourceManager({
            loaders: this.loaders,
            manifest: this.manifest
        }))
        this.registerModule('inputBinder', getInputBinder(inputBinder))
        this.registerModule('inputManager', getInputManager(inputManager))

        this.registerDevice('keyboard', new KeyboardDevice(keyboard))
        this.registerDevice('mouse', new MouseDevice({
            ...mouse,
            container: this.perkyView.element
        }))

        this.#initEvents()
        
        this.#installPlugins(plugins)
    }


    #installPlugins (plugins) {
        plugins.forEach(plugin => {
            const pluginName = plugin.name || plugin.constructor.name
            this.installPlugin(pluginName, plugin)
        })
    }


    installPlugin (pluginName, plugin) {
        return this.#plugins.install(pluginName, plugin)
    }


    uninstallPlugin (pluginName) {
        return this.#plugins.uninstall(pluginName)
    }


    getPlugin (pluginName) {
        return this.#plugins.getPlugin(pluginName)
    }


    isPluginInstalled (pluginName) {
        return this.#plugins.isInstalled(pluginName)
    }


    getAllPlugins () {
        return this.#plugins.getAllPlugins()
    }


    getPluginNames () {
        return this.#plugins.getPluginNames()
    }


    get element () {
        return this.perkyView.element
    }


    mountTo (element) {
        return this.perkyView.mountTo(element)
    }
    

    dismount () {
        return this.perkyView.dismount()
    }


    get mounted () {
        return this.perkyView && this.perkyView.mounted
    }


    async loadSource (type, id) {
        return this.sourceManager.loadSource(type, id)
    }


    async loadTag (tag) {
        return this.sourceManager.loadTag(tag)
    }


    async loadAll () {
        return this.sourceManager.loadAll()
    }


    async preload () {
        return this.loadTag('preload')
    }


    registerLoader (name, loaderFunction) {
        if (!name || typeof name !== 'string') {
            throw new Error('Loader name must be a non-empty string')
        }

        if (!loaderFunction || typeof loaderFunction !== 'function') {
            throw new Error('Loader must be a function')
        }

        this.loaders.set(name, loaderFunction)
        return this
    }


    getSource (type, id) {
        const sourceDescriptor = this.manifest.getSourceDescriptor(type, id)
        return sourceDescriptor ? sourceDescriptor.source : null
    }


    getImage (id) {
        return this.getSource('images', id)
    }


    config (path, value) {
        return this.manifest.config(path, value)
    }


    setHtml (html) {
        this.perkyView.html = html
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
        return this.inputManager ? this.inputManager.isPressed(deviceName, controlName) : false
    }


    isKeyPressed (keyName) {
        return this.isPressed('keyboard', keyName)
    }


    isMousePressed (buttonName) {
        return this.isPressed('mouse', buttonName)
    }


    isPressedAny (controlName) {
        return this.inputManager ? this.inputManager.isPressedAny(controlName) : false
    }


    getInputValue (deviceName, controlName) {
        return this.inputManager ? this.inputManager.getValueFor(deviceName, controlName) : undefined
    }


    getKeyValue (keyName) {
        return this.getInputValue('keyboard', keyName)
    }


    getMouseValue (buttonName) {
        return this.getInputValue('mouse', buttonName)
    }


    getInputValueAny (controlName) {
        return this.inputManager ? this.inputManager.getValueAny(controlName) : undefined
    }


    getControl (deviceName, controlName) {
        return this.inputManager ? this.inputManager.getControl(deviceName, controlName) : null
    }


    getControlAny (controlName) {
        return this.inputManager ? this.inputManager.getControlAny(controlName) : null
    }


    addControl (deviceNameOrControl, ControlOrParams, params) {
        return this.inputManager ? this.inputManager.addControl(deviceNameOrControl, ControlOrParams, params) : null
    }


    registerDevice (name, device) {
        return this.inputManager ? this.inputManager.registerDevice(name, device) : false
    }


    getDevice (name) {
        return this.inputManager ? this.inputManager.getDevice(name) : undefined
    }


    get displayMode () {
        return this.perkyView.displayMode
    }


    setDisplayMode (mode) {
        this.perkyView.setDisplayMode(mode)
        return this
    }


    enterFullscreenMode () {
        this.perkyView.enterFullscreenMode()
        return this
    }

    exitFullscreenMode () {
        this.perkyView.exitFullscreenMode()
        return this
    }


    toggleFullscreen () {
        const mode = this.displayMode
        if (mode === 'fullscreen') {
            this.exitFullscreenMode()
        } else {
            this.enterFullscreenMode()
        }
        return this
    }


    bindKey (keyName, actionNameOrOptions, eventType = 'pressed', controllerName = null) {
        if (typeof actionNameOrOptions === 'object') {
            const {actionName, eventType: objEventType = 'pressed', controllerName: objControllerName = null} = actionNameOrOptions
            
            if (!actionName || typeof actionName !== 'string') {
                throw new Error('actionName is required and must be a string')
            }
            
            return this.bind({
                deviceName: 'keyboard',
                controlName: keyName,
                actionName,
                eventType: objEventType,
                controllerName: objControllerName
            })
        } else {
            if (!actionNameOrOptions || typeof actionNameOrOptions !== 'string') {
                throw new Error('actionName is required and must be a string')
            }
            
            return this.bind({
                deviceName: 'keyboard',
                controlName: keyName,
                actionName: actionNameOrOptions,
                eventType,
                controllerName
            })
        }
    }


    bindMouse (buttonName, actionNameOrOptions, eventType = 'pressed', controllerName = null) {
        if (typeof actionNameOrOptions === 'object') {
            const {actionName, eventType: objEventType = 'pressed', controllerName: objControllerName = null} = actionNameOrOptions
            
            if (!actionName || typeof actionName !== 'string') {
                throw new Error('actionName is required and must be a string')
            }
            
            return this.bind({
                deviceName: 'mouse',
                controlName: buttonName,
                actionName,
                eventType: objEventType,
                controllerName: objControllerName
            })
        } else {
            if (!actionNameOrOptions || typeof actionNameOrOptions !== 'string') {
                throw new Error('actionName is required and must be a string')
            }
            
            return this.bind({
                deviceName: 'mouse',
                controlName: buttonName,
                actionName: actionNameOrOptions,
                eventType,
                controllerName
            })
        }
    }


    bindCombo (controls, actionName, controllerName = null, eventType = 'pressed') {
        return this.inputBinder.bindCombo(controls, actionName, controllerName, eventType)
    }


    #initEvents () {
        const {perkyView, inputManager, sourceManager} = this

        perkyView.on('resize', this.emitter('resize'))
        perkyView.on('mount', this.emitter('mount'))

        inputManager.on('control:pressed', this.#handleInputEvent.bind(this, 'pressed'))
        inputManager.on('control:released', this.#handleInputEvent.bind(this, 'released'))

        sourceManager.on('loader:progress', this.emitter('loader:progress'))
        sourceManager.on('loader:complete', this.emitter('loader:complete'))
        sourceManager.on('loader:error', this.emitter('loader:error'))

        perkyView.on('displayMode:changed', this.emitter('displayMode:changed'))
    }


    #handleInputEvent (eventType, control, event, device) {
        if (!this.inputManager || !this.inputBinder) {
            return
        }

        this.emit(`control:${eventType}`, control, event, device)

        const deviceName = this.inputManager.deviceKeyFor(device)
        const matchingBindings = this.inputBinder.getBindingsForInput({
            deviceName,
            controlName: control.name,
            eventType
        })

        matchingBindings.forEach(binding => {
            if (typeof binding.shouldTrigger !== 'function' || binding.shouldTrigger(this.inputManager)) {
                this.actionDispatcher.dispatchAction(binding, control, event, device)
            }
        })
    }


    dispose () {
        if (this.perkyView) {
            this.perkyView.dispose()
        }
        return super.dispose()
    }

}



function getInputBinder (inputBinder) {
    if (inputBinder && typeof inputBinder === 'object' && !(inputBinder instanceof InputBinder)) {
        return new InputBinder(inputBinder)
    }

    if (inputBinder instanceof InputBinder) {
        return inputBinder
    }

    return new InputBinder()
}



function getInputManager (inputManager) {
    if (inputManager && typeof inputManager === 'object' && !(inputManager instanceof InputManager)) {
        return new InputManager(inputManager)
    }

    if (inputManager instanceof InputManager) {
        return inputManager
    }

    return new InputManager()
}
