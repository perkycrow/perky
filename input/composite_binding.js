import InputBinding from './input_binding.js'


export default class CompositeBinding extends InputBinding {

    constructor ({
        controls,
        actionName,
        controllerName = null,
        eventType = 'pressed'
    }) {

        if (!Array.isArray(controls) || controls.length < 2) {
            throw new Error('CompositeBinding requires an array of at least 2 controls')
        }

        super({
            deviceName: 'composite',
            controlName: CompositeBinding.generateControlName(controls),
            actionName,
            controllerName,
            eventType
        })

        this.controls = controls
    }


    static generateControlName (controls) {
        const controlNames = controls.map(c => `${c.deviceName}:${c.controlName}`).join('+')
        return `combo(${controlNames})`
    }


    matches ({deviceName, controlName, eventType}) {
        if (deviceName === 'composite' && controlName === this.controlName && eventType === this.eventType) {
            return true
        }

        return this.controls.some(c => {
            return c.deviceName === deviceName && c.controlName === controlName
        }) && eventType === this.eventType
    }


    shouldTrigger (inputSystem) {
        return this.controls.every(({deviceName, controlName}) => {
            return inputSystem.isPressed(deviceName, controlName)
        })
    }

}
