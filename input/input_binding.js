export default class InputBinding {

    constructor ({
        deviceName,
        controlName,
        actionName,
        controllerName = null,
        eventType = 'pressed'
    }) {
        this.deviceName = deviceName
        this.controlName = controlName
        this.actionName = actionName
        this.controllerName = controllerName
        this.eventType = eventType
    }


    get key () {
        return InputBinding.keyFor({
            deviceName: this.deviceName,
            controlName: this.controlName,
            actionName: this.actionName,
            controllerName: this.controllerName,
            eventType: this.eventType
        })
    }


    static keyFor ({deviceName, controlName, actionName, controllerName = null, eventType = 'pressed'}) {
        if (controllerName) {
            return `${deviceName}:${controlName}:${eventType}:${actionName}:${controllerName}`
        }

        return `${deviceName}:${controlName}:${eventType}:${actionName}`
    }


    matches ({deviceName, controlName, eventType}) {
        return this.deviceName === deviceName &&
            this.controlName === controlName &&
            this.eventType === eventType
    }


    updateInput ({deviceName, controlName}) {
        this.deviceName = deviceName
        this.controlName = controlName
    }

}
