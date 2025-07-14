import InputControl from '../input_control'

const {VALUE, OLD_VALUE} = InputControl


export default class WheelControl extends InputControl {

    getDefaultValue () { // eslint-disable-line class-methods-use-this
        return {deltaX: 0, deltaY: 0, deltaZ: 0}
    }


    setValue (wheelEvent, event = null) {
        const delta = {
            deltaX: wheelEvent.deltaX || 0,
            deltaY: wheelEvent.deltaY || 0,
            deltaZ: wheelEvent.deltaZ || 0
        }

        this[OLD_VALUE] = this[VALUE]
        this[VALUE] = delta

        this.emit('updated', this[VALUE], this[OLD_VALUE], event)

        return true
    }


    get deltaY () {
        return this.value.deltaY
    }


    get deltaX () {
        return this.value.deltaX
    }


    get deltaZ () {
        return this.value.deltaZ
    }

}
