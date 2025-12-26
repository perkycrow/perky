import PerkyModule from '../core/perky_module'
import InputBinder from './input_binder'
import KeyboardDevice from './input_devices/keyboard_device'
import MouseDevice from './input_devices/mouse_device'
import Vec2 from '../math/vec2'


export default class InputSystem extends PerkyModule {

    static $category = 'inputSystem'

    constructor (options = {}) {
        const {perkyView, bindings = []} = options
        super(options)

        this.create(InputBinder, {
            $bind: 'inputBinder',
            bindings
        })

        this.registerDevice(KeyboardDevice, {
            $name: 'keyboard',
            $bind: 'keyboard'
        })

        this.registerDevice(MouseDevice, {
            $name: 'mouse',
            $bind: 'mouse',
            container: perkyView?.element
        })

        this.#initEvents()
    }


    onInstall (host) {
        host.delegate(this, [
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


    registerDevice (DeviceClass, options = {}) {
        return this.create(DeviceClass, options)
    }


    getDevice (name) {
        return this.getChild(name)
    }


    isPressed (deviceName, controlName) {
        const device = this.getDevice(deviceName)
        return device ? device.isPressed(controlName) : false
    }


    getValueFor (deviceName, controlName) {
        const device = this.getDevice(deviceName)
        return device ? device.getValueFor(controlName) : undefined
    }


    getControl (deviceName, controlName) {
        const device = this.getDevice(deviceName)
        return device ? device.getControl(controlName) : null
    }


    isPressedAny (controlName) {
        const deviceNames = this.listNamesFor('device')
        for (const name of deviceNames) {
            const device = this.getChild(name)
            if (device && device.isPressed(controlName)) {
                return true
            }
        }
        return false
    }


    getValueAny (controlName) {
        const deviceNames = this.listNamesFor('device')
        for (const name of deviceNames) {
            const device = this.getChild(name)
            if (device) {
                const value = device.getValueFor(controlName)
                if (value !== undefined) {
                    return value
                }
            }
        }
        return undefined
    }


    getControlAny (controlName) {
        const deviceNames = this.listNamesFor('device')
        for (const name of deviceNames) {
            const device = this.getChild(name)
            if (device) {
                const control = device.getControl(controlName)
                if (control) {
                    return control
                }
            }
        }
        return null
    }


    getAllPressed (controlName) {
        const results = []
        const deviceNames = this.listNamesFor('device')
        for (const name of deviceNames) {
            const device = this.getChild(name)
            if (device && device.isPressed(controlName)) {
                results.push(device)
            }
        }
        return results
    }


    getPressedControls (deviceName) {
        const device = this.getDevice(deviceName)
        return device ? device.getPressedControls() : []
    }


    getAllValues (controlName) {
        const results = []
        const deviceNames = this.listNamesFor('device')
        for (const name of deviceNames) {
            const device = this.getChild(name)
            if (device) {
                const value = device.getValueFor(controlName)
                if (value !== undefined) {
                    results.push({device, value})
                }
            }
        }
        return results
    }


    addControl (deviceNameOrControl, ControlOrParams = {}, params = {}) {

        if (typeof deviceNameOrControl === 'string') {
            const device = this.getDevice(deviceNameOrControl)

            if (!device) {
                throw new Error(`Device '${deviceNameOrControl}' not found`)
            }

            return device.findOrCreateControl(ControlOrParams, params)

        } else if (typeof deviceNameOrControl === 'function') {

            return this.addControlToFirst(deviceNameOrControl, ControlOrParams)
        }

        return null
    }


    addControlToFirst (Control, params = {}) {
        const deviceNames = this.listNamesFor('device')
        const firstDevice = deviceNames.length > 0 ? this.getChild(deviceNames[0]) : null
        if (!firstDevice) {
            throw new Error('No devices available')
        }
        return firstDevice.findOrCreateControl(Control, params)
    }


    addControlToAll (Control, params = {}) {
        const results = []
        const deviceNames = this.listNamesFor('device')
        for (const name of deviceNames) {
            const device = this.getChild(name)
            if (device) {
                const control = device.findOrCreateControl(Control, params)
                results.push({device, control})
            }
        }
        return results
    }


    deviceKeyFor (device) {
        return this.childrenRegistry.keyFor(device)
    }


    getInputValue (deviceName, controlName) {
        return this.getValueFor(deviceName, controlName)
    }


    getInputValueAny (controlName) {
        return this.getValueAny(controlName)
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
                if (binding.shouldTrigger(this)) {
                    return true
                }
            } else if (this.isPressed(binding.deviceName, binding.controlName)) {
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
                const control = this.getControl(deviceName, controlName)
                if (control) {
                    controls.push(control)
                }
            }
        } else {
            const control = this.getControl(binding.deviceName, binding.controlName)
            if (control) {
                controls.push(control)
            }
        }

        return controls
    }


    #initEvents () {
        this.on('control:pressed', this.#handleInputEvent.bind(this, 'pressed'))
        this.on('control:released', this.#handleInputEvent.bind(this, 'released'))
    }


    #handleInputEvent (eventType, control, event, device) {
        const deviceName = this.deviceKeyFor(device)
        const matchingBindings = this.inputBinder.getBindingsForInput({
            deviceName,
            controlName: control.name,
            eventType
        })

        matchingBindings.forEach(binding => {
            if (typeof binding.shouldTrigger !== 'function' || binding.shouldTrigger(this)) {
                this.host?.actionDispatcher?.dispatchAction(binding, event, device)
            }
        })
    }

}
