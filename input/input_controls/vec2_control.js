import InputControl from '../input_control.js'
import Vec2 from '../../math/vec2.js'


const {VALUE, OLD_VALUE} = InputControl

export default class Vec2Control extends InputControl {

    getDefaultValue () { // eslint-disable-line class-methods-use-this -- clean
        return new Vec2()
    }


    setValue (value, event = null) {
        if (!(value instanceof Vec2)) {
            value = new Vec2(value)
        }

        if (this[VALUE] && this[VALUE].equals(value)) {
            return false
        }

        this[OLD_VALUE] = this[VALUE]
        this[VALUE] = new Vec2(value)

        this.emit('updated', this[VALUE], this[OLD_VALUE], event)

        return true
    }

}
