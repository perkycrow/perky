import PerkyModule from '../core/perky_module'


export default class InputManager extends PerkyModule {


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
    }


    registerDevice (DeviceClass, options = {}) {
        const device = this.create(DeviceClass, {
            $category: 'device',
            $lifecycle: true,
            ...options
        })

        this.#forwardDeviceEvents(device)
        return device
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
        const deviceNames = this.getChildrenByCategory('device')
        for (const name of deviceNames) {
            const device = this.getChild(name)
            if (device && device.isPressed(controlName)) {
                return true
            }
        }
        return false
    }


    getValueAny (controlName) {
        const deviceNames = this.getChildrenByCategory('device')
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
        const deviceNames = this.getChildrenByCategory('device')
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
        const deviceNames = this.getChildrenByCategory('device')
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
        const deviceNames = this.getChildrenByCategory('device')
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
        const deviceNames = this.getChildrenByCategory('device')
        const firstDevice = deviceNames.length > 0 ? this.getChild(deviceNames[0]) : null
        if (!firstDevice) {
            throw new Error('No devices available')
        }
        return firstDevice.findOrCreateControl(Control, params)
    }


    addControlToAll (Control, params = {}) {
        const results = []
        const deviceNames = this.getChildrenByCategory('device')
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
