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
        const {extensions = [], inputManager, inputBinder, keyboard = {}, mouse = {}} = params

        super(params)

        this.loaders = new Registry(loaders)

        this.use(PerkyView, {
            $bind: 'perkyView',
            className: 'perky-application'
        })

        this.use(SourceManager, {
            $bind: 'sourceManager',
            loaders: this.loaders,
            manifest: this.manifest
        })

        this.use(InputBinder, {
            instance: getOrCreate(InputBinder, inputBinder),
            $bind: 'inputBinder'
        })

        this.use(InputManager, {
            instance: getOrCreate(InputManager, inputManager),
            $bind: 'inputManager'
        })

        this.use(KeyboardDevice, {
            $name: 'keyboard',
            $category: 'device',
            $bind: 'keyboard',
            ...keyboard
        })
        this.inputManager.registerDevice('keyboard', this.keyboard)

        this.use(MouseDevice, {
            $name: 'mouse',
            $category: 'device',
            $bind: 'mouse',
            ...mouse,
            container: this.perkyView.element
        })
        this.inputManager.registerDevice('mouse', this.mouse)

        this.#initEvents()

        if (typeof this.configure === 'function') {
            this.configure(params)
        }

        this.#installExtensions(extensions)
    }


    #installExtensions (extensions) {
        extensions.forEach(extension => {
            const extensionName = extension.name || extension.constructor.name
            this.use(extension, {$name: extensionName, $category: 'extension'})
        })
    }


    getInputValue (deviceName, controlName) {
        return this.inputManager ? this.inputManager.getValueFor(deviceName, controlName) : undefined
    }


    getInputValueAny (controlName) {
        return this.inputManager ? this.inputManager.getValueAny(controlName) : undefined
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


    getImage (id) {
        return this.getSource('images', id)
    }


    isKeyPressed (keyName) {
        return this.isPressed('keyboard', keyName)
    }


    isMousePressed (buttonName) {
        return this.isPressed('mouse', buttonName)
    }


    getKeyValue (keyName) {
        return this.getInputValue('keyboard', keyName)
    }


    getMouseValue (buttonName) {
        return this.getInputValue('mouse', buttonName)
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


    #initEvents () {
        const {inputManager} = this

        inputManager.on('control:pressed', this.#handleInputEvent.bind(this, 'pressed'))
        inputManager.on('control:released', this.#handleInputEvent.bind(this, 'released'))
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

}



function getOrCreate (Class, instanceOrOptions) {
    if (instanceOrOptions && typeof instanceOrOptions === 'object' && !(instanceOrOptions instanceof Class)) {
        return new Class(instanceOrOptions)
    }

    if (instanceOrOptions instanceof Class) {
        return instanceOrOptions
    }

    return new Class()
}
