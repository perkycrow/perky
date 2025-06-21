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
            actionName: this.actionName,
            controllerName: this.controllerName,
            eventType: this.eventType
        })
    }


    static keyFor ({actionName, controllerName = null, eventType = 'pressed'}) {
        if (controllerName) {
            return `${eventType}:${actionName}:${controllerName}`
        }

        return `${eventType}:${actionName}`
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
