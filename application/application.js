import Engine from '../core/engine'
import Registry from '../core/registry'
import PerkyView from './perky_view'
import SourceManager from './source_manager'
import {loaders} from './loaders'
import InputBinder from '../input/input_binder'
import InputManager from '../input/input_manager'
import KeyboardDevice from '../input/input_devices/keyboard_device'
import MouseDevice from '../input/input_devices/mouse_device'


export default class Application extends Engine {

    constructor (params = {}) {
        super(params)

        const {inputManager, inputBinder} = params

        this.loaders = new Registry(loaders)

        this.registerModule('perkyView', new PerkyView({className: 'perky-application'}))
        this.registerModule('sourceManager', new SourceManager(this))
        this.registerModule('inputBinder', getInputBinder(inputBinder))
        this.registerModule('inputManager', getInputManager(inputManager))

        this.registerDevice('keyboard', new KeyboardDevice())
        this.registerDevice('mouse', new MouseDevice())

        this.#initEvents()
    }


    get element () {
        return this.perkyView.element
    }

    mountTo (element) {
        return this.perkyView.mountTo(element)
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


    getSource (type, id) {
        const sourceDescriptor = this.manifest.getSourceDescriptor(type, id)
        return sourceDescriptor ? sourceDescriptor.source : null
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


    isPressedAny (controlName) {
        return this.inputManager ? this.inputManager.isPressedAny(controlName) : false
    }


    getInputValue (deviceName, controlName) {
        return this.inputManager ? this.inputManager.getValueFor(deviceName, controlName) : undefined
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


    #initEvents () {
        const {perkyView, inputManager} = this

        perkyView.on('resize', this.emitter('resize'))

        inputManager.on('control:pressed', this.#handleInputEvent.bind(this, 'pressed'))
        inputManager.on('control:released', this.#handleInputEvent.bind(this, 'released'))
    }


    #handleInputEvent (eventType, control, event, device) {
        if (!this.inputManager || !this.inputBinder) {
            return
        }

        const deviceName = this.inputManager.deviceKeyFor(device)
        const matchingBindings = this.inputBinder.getBindingsForInput({
            deviceName,
            controlName: control.name,
            eventType
        })

        matchingBindings.forEach(binding => {
            this.actionDispatcher.dispatchAction(binding, control, event, device)
        })
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
