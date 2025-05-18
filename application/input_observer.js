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
        this.controlsMap = {}
        this.methodsMap = {}

        initEvents(this)

        if (mouse) {
            this.registerDevice('mouse', new MouseDevice({container}))
        }
        if (keyboard) {
            this.registerDevice('keyboard', new KeyboardDevice())
        }
    }


    get controls () {
        return Object.keys(this.controlsMap)
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

}


function initEvents (observer) {
    observer.on('device:set', (deviceName, device) => {
        addEvents(observer, deviceName, device)
        addMethods(observer, deviceName, device)
        addControls(observer, deviceName, device)
    })

    observer.on('device:delete', (deviceName, device) => {
        removeEvents(observer, deviceName, device)
        removeMethods(observer, deviceName, device)
        removeControls(observer, deviceName, device)
    })
}


function addEvents (observer, deviceName, device) {
    const events = device.events || []

    for (const event of events) {
        device.on(event, (data) => observer.emit(event, data, deviceName, device))

        observer.eventsMap[event] ||= []
        observer.eventsMap[event].push(deviceName)
    }
}


function removeEvents (observer, deviceName, device) {
    const events = device.events || []

    for (const event of events) {
        observer.eventsMap[event] ||= []

        const index = observer.eventsMap[event].indexOf(deviceName)

        if (index !== -1) {
            observer.eventsMap[event].splice(index, 1)
        }
    }
}


function addMethods (observer, deviceName, device) {
    const methods = device.methods || []

    for (const method of methods) {
        addMethod(observer, deviceName, device, method)
    }
}

function addMethod (observer, deviceName, device, method) {
    if (typeof device[method] === 'function') {
        if (!(method in observer)) {
            observer[method] = (...args) => device[method](...args)
        }

        observer.methodsMap[method] ||= []
        if (!observer.methodsMap[method].includes(deviceName)) {
            observer.methodsMap[method].push(deviceName)
        }
    }
}


function updateMethodProxy (observer, method) {
    if (!observer.methodsMap[method] || observer.methodsMap[method].length === 0) {
        delete observer[method]
    } else {
        const newDeviceName = observer.methodsMap[method][0]
        const newDevice = observer.devices.get(newDeviceName)

        if (newDevice && typeof newDevice[method] === 'function') {
            observer[method] = (...args) => newDevice[method](...args)
        } else {
            delete observer[method]
            observer.methodsMap[method] = []
        }
    }
}


function removeMethods (observer, deviceName, device) {
    const methods = device.methods || []

    for (const method of methods) {
        observer.methodsMap[method] ||= []

        const index = observer.methodsMap[method].indexOf(deviceName)

        if (index !== -1) {
            observer.methodsMap[method].splice(index, 1)
            updateMethodProxy(observer, method)
        }
    }
}


function addControls (observer, deviceName, device) {
    const controls = device.controls || []

    for (const control of controls) {
        observer.controlsMap[control] ||= []
        if (!observer.controlsMap[control].includes(deviceName)) {
            observer.controlsMap[control].push(deviceName)
        }
    }
}


function removeControls (observer, deviceName, device) {
    const controls = device.controls || []

    for (const control of controls) {
        observer.controlsMap[control] ||= []

        const index = observer.controlsMap[control].indexOf(deviceName)

        if (index !== -1) {
            observer.controlsMap[control].splice(index, 1)
        }
    }
}
