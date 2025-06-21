
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
        if (this.controllerName) {
            return `${this.eventType}:${this.actionName}:${this.controllerName}`
        }

        return `${this.eventType}:${this.actionName}`
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
