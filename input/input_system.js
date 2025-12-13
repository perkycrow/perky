import PerkyModule from '../core/perky_module'
import InputManager from './input_manager'
import InputBinder from './input_binder'
import KeyboardDevice from './input_devices/keyboard_device'
import MouseDevice from './input_devices/mouse_device'
import Vec2 from '../math/vec2'


export default class InputSystem extends PerkyModule {

    constructor ({inputBinder, keyboard = {}, mouse = {}, perkyView} = {}) {
        super({name: 'inputSystem'})

        this.create(InputBinder, {
            $bind: 'inputBinder',
            inputBinder
        })

        this.create(InputManager, {
            $bind: 'inputManager'
        })

        this.inputManager.registerDevice(KeyboardDevice, {
            $name: 'keyboard',
            $bind: 'keyboard',
            ...keyboard
        })

        this.inputManager.registerDevice(MouseDevice, {
            $name: 'mouse',
            $bind: 'mouse',
            ...mouse,
            container: perkyView?.element
        })

        this.#initEvents()
    }


    get keyboard () {
        return this.inputManager.getDevice('keyboard')
    }


    get mouse () {
        return this.inputManager.getDevice('mouse')
    }


    onInstall (host) {
        host.delegate(this, [
            'inputManager',
            'registerDevice',
            'unregisterDevice',
            'getDevice',
            'isPressed',
            'isPressedAny',
            'getAllPressed',
            'getValueFor',
            'getValueAny',
            'addControl',
            'getControl',
            'getControlAny',
            'getPressedControls'
        ])

        host.delegate(this, [
            'inputBinder',
            'bind',
            'unbind',
            'getBinding',
            'hasBinding',
            'getBindingsForInput',
            'getBindingsForAction',
            'getAllBindings',
            'clearBindings',
            'bindCombo'
        ])

        host.delegate(this, [
            'bindKey',
            'bindMouse',
            'isKeyPressed',
            'isMousePressed',
            'getKeyValue',
            'getMouseValue',
            'isActionPressed',
            'getActionControls',
            'getInputValue',
            'getInputValueAny',
            'getDirection'
        ])
    }


    getInputValue (deviceName, controlName) {
        return this.inputManager.getValueFor(deviceName, controlName)
    }


    getInputValueAny (controlName) {
        return this.inputManager.getValueAny(controlName)
    }


    isKeyPressed (keyName) {
        return this.inputManager.isPressed('keyboard', keyName)
    }


    isMousePressed (buttonName) {
        return this.inputManager.isPressed('mouse', buttonName)
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

            return this.inputBinder.bind({
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

            return this.inputBinder.bind({
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

            return this.inputBinder.bind({
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

            return this.inputBinder.bind({
                deviceName: 'mouse',
                controlName: buttonName,
                actionName: actionNameOrOptions,
                eventType,
                controllerName
            })
        }
    }


    isActionPressed (actionName, controllerName = null) {
        const bindings = this.inputBinder.getBindingsForAction(actionName, controllerName, 'pressed')

        for (const binding of bindings) {
            if (typeof binding.shouldTrigger === 'function') {
                if (binding.shouldTrigger(this.inputManager)) {
                    return true
                }
            } else if (this.inputManager.isPressed(binding.deviceName, binding.controlName)) {
                return true
            }
        }

        return false
    }


    getActionControls (actionName, controllerName = null) {
        const bindings = this.inputBinder.getBindingsForAction(actionName, controllerName, 'pressed')
        const controls = []

        for (const binding of bindings) {
            controls.push(...this.#getControlsFromBinding(binding))
        }

        return controls
    }


    getDirection (name = 'move') {
        const up = name + 'Up'
        const down = name + 'Down'
        const left = name + 'Left'
        const right = name + 'Right'

        const x = (this.isActionPressed(right) ? 1 : 0)
            - (this.isActionPressed(left) ? 1 : 0)
        const y = (this.isActionPressed(up) ? 1 : 0)
            - (this.isActionPressed(down) ? 1 : 0)

        const vec = new Vec2(x, y)

        return vec.length() > 0 ? vec.clone().normalize() : vec
    }


    #getControlsFromBinding (binding) {
        const controls = []

        if (binding.controls && Array.isArray(binding.controls)) {
            for (const {deviceName, controlName} of binding.controls) {
                const control = this.inputManager.getControl(deviceName, controlName)
                if (control) {
                    controls.push(control)
                }
            }
        } else {
            const control = this.inputManager.getControl(binding.deviceName, binding.controlName)
            if (control) {
                controls.push(control)
            }
        }

        return controls
    }


    #initEvents () {
        const {inputManager} = this

        inputManager.on('control:pressed', this.#handleInputEvent.bind(this, 'pressed'))
        inputManager.on('control:released', this.#handleInputEvent.bind(this, 'released'))

        this.delegateEvents(inputManager, ['control:pressed', 'control:released'])
    }


    #handleInputEvent (eventType, control, event, device) {
        const deviceName = this.inputManager.deviceKeyFor(device)
        const matchingBindings = this.inputBinder.getBindingsForInput({
            deviceName,
            controlName: control.name,
            eventType
        })

        matchingBindings.forEach(binding => {
            if (typeof binding.shouldTrigger !== 'function' || binding.shouldTrigger(this.inputManager)) {
                this.host?.actionDispatcher?.dispatchAction(binding, event, device)
            }
        })
    }

}
