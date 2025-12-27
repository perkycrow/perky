import InputControl from '../input_control'

const {VALUE, OLD_VALUE} = InputControl


export default class NavigationControl extends InputControl {

    getDefaultValue () { // eslint-disable-line class-methods-use-this
        return {deltaX: 0, deltaY: 0, deltaZ: 0, event: null}
    }


    setValue (wheelEvent, event = null) {
        const delta = {
            deltaX: wheelEvent.deltaX || 0,
            deltaY: wheelEvent.deltaY || 0,
            deltaZ: wheelEvent.deltaZ || 0,
            event: wheelEvent
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

    get event () {
        return this.value.event
    }

    get isTrackpadPinchZoom () {
        return this.event && (this.event.ctrlKey || this.event.metaKey)
    }

    get isMouseWheelZoom () {
        if (!this.event || this.isTrackpadPinchZoom) {
            return false
        }
        
        const isVerticalOnly = Math.abs(this.deltaX) <= 0.1
        const isSignificantVertical = Math.abs(this.deltaY) >= 10
        
        return isVerticalOnly && isSignificantVertical
    }

    get isTrackpadPan () {
        if (!this.event || this.isTrackpadPinchZoom) {
            return false
        }
        
        return Math.abs(this.deltaX) > 0.1 || Math.abs(this.deltaY) > 0.1
    }

}
