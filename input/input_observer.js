import PerkyModule from '../core/perky_module'
import ModuleRegistry from '../core/module_registry'
import MouseDevice from './input_devices/mouse_device'
import KeyboardDevice from './input_devices/keyboard_device'


export default class InputObserver extends PerkyModule {

    constructor ({
        container,
        mouse = true,
        keyboard = true
    } = {}) {
        super()
        this.devices = new ModuleRegistry({
            registryName: 'device',
            parentModule: this,
            parentModuleName: 'inputObserver',
            bind: true
        })

        this.eventsMap = {}
        this.methodsMap = {}

        this.#initEvents()

        if (mouse) {
            this.registerDevice('mouse', new MouseDevice({container}))
        }
        if (keyboard) {
            this.registerDevice('keyboard', new KeyboardDevice())
        }
    }


    get methods () {
        return Object.keys(this.methodsMap)
    }


    get events () {
        return Object.keys(this.eventsMap)
    }


    isPressed (deviceName, code) {
        const device = this.devices.get(deviceName)

        if (device && typeof device.isPressed === 'function') {
            return device.isPressed(code)
        }

        return false
    }


    registerDevice (deviceName, device) {
        this.devices.set(deviceName, device)
    }


    unregisterDevice (deviceName) {
        return this.devices.delete(deviceName)
    }


    #initEvents () {
        this.on('device:set', (deviceName, device) => {
            this.#addEvents(deviceName, device)
            this.#addMethods(deviceName, device)
        })

        this.on('device:delete', (deviceName, device) => {
            this.#removeEvents(deviceName, device)
            this.#removeMethods(deviceName, device)
        })
    }


    #addEvents (deviceName, device) {
        const events = device.events || []

        for (const event of events) {
            device.on(event, (data) => this.emit(event, data, deviceName, device))

            this.eventsMap[event] ||= []
            this.eventsMap[event].push(deviceName)
        }
    }


    #removeEvents (deviceName, device) {
        const events = device.events || []

        for (const event of events) {
            this.eventsMap[event] ||= []

            const index = this.eventsMap[event].indexOf(deviceName)

            if (index !== -1) {
                this.eventsMap[event].splice(index, 1)
            }
        }
    }


    #addMethods (deviceName, device) {
        const methods = device.methods || []

        for (const method of methods) {
            this.#addMethod(deviceName, device, method)
        }
    }


    #addMethod (deviceName, device, method) {
        if (typeof device[method] === 'function') {
            if (!(method in this)) {
                this[method] = (...args) => device[method](...args)
            }

            this.methodsMap[method] ||= []
            if (!this.methodsMap[method].includes(deviceName)) {
                this.methodsMap[method].push(deviceName)
            }
        }
    }


    #updateMethodProxy (method) {
        if (!this.methodsMap[method] || this.methodsMap[method].length === 0) {
            delete this[method]
        } else {
            const newDeviceName = this.methodsMap[method][0]
            const newDevice = this.devices.get(newDeviceName)

            if (newDevice && typeof newDevice[method] === 'function') {
                this[method] = (...args) => newDevice[method](...args)
            } else {
                delete this[method]
                this.methodsMap[method] = []
            }
        }
    }


    #removeMethods (deviceName, device) {
        const methods = device.methods || []

        for (const method of methods) {
            this.methodsMap[method] ||= []

            const index = this.methodsMap[method].indexOf(deviceName)

            if (index !== -1) {
                this.methodsMap[method].splice(index, 1)
                this.#updateMethodProxy(method)
            }
        }
    }

}
