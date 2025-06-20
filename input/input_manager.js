import PerkyModule from '../core/perky_module'
import ModuleRegistry from '../core/module_registry'


export default class InputManager extends PerkyModule {

    constructor () {
        super()
        
        this.devices = new ModuleRegistry({
            registryName: 'device',
            parentModule: this,
            parentModuleName: 'inputManager',
            bind: true,
            autoInit: true,
            autoStart: true
        })

        this.#initEvents()
    }


    registerDevice (name, device) {
        if (!(device && device.name)) {
            throw new Error('Device must have a name')
        }

        return this.devices.set(name, device)
    }


    getDevice (name) {
        return this.devices.get(name)
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
        for (const device of this.devices.values) {
            if (device.isPressed(controlName)) {
                return true
            }
        }
        return false
    }


    getValueAny (controlName) {
        for (const device of this.devices.values) {
            const value = device.getValueFor(controlName)
            if (value !== undefined) {
                return value
            }
        }
        return undefined
    }


    getControlAny (controlName) {
        for (const device of this.devices.values) {
            const control = device.getControl(controlName)
            if (control) {
                return control
            }
        }
        return null
    }


    getAllPressed (controlName) {
        const results = []
        for (const device of this.devices.values) {
            if (device.isPressed(controlName)) {
                results.push(device)
            }
        }
        return results
    }


    getAllValues (controlName) {
        const results = []
        for (const device of this.devices.values) {
            const value = device.getValueFor(controlName)
            if (value !== undefined) {
                results.push({device, value})
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
        const firstDevice = this.devices.values.next().value
        if (!firstDevice) {
            throw new Error('No devices available')
        }
        return firstDevice.findOrCreateControl(Control, params)
    }


    addControlToAll (Control, params = {}) {
        const results = []
        for (const device of this.devices.values) {
            const control = device.findOrCreateControl(Control, params)
            results.push({device, control})
        }
        return results
    }


    #initEvents () {
        this.devices.on('set', (deviceName, device) => {
            this.#forwardDeviceEvents(device)
        })
    }


    #forwardDeviceEvents (device) {
        device.on('control:pressed', (control, event) => {
            this.emit('control:pressed', control, event, device)
        })

        device.on('control:released', (control, event) => {
            this.emit('control:released', control, event, device)
        })

        device.on('control:updated', (control, value, oldValue, event) => {
            this.emit('control:updated', control, value, oldValue, event, device)
        })
    }

}
