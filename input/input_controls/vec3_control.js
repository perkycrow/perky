import InputControl from '../input_control.js'
import Vec3 from '../../math/vec3.js'


const {VALUE, OLD_VALUE} = InputControl

export default class Vec3Control extends InputControl {

    getDefaultValue () { // eslint-disable-line class-methods-use-this -- clean
        return new Vec3()
    }


    setValue (value, event = null) {
        if (!(value instanceof Vec3)) {
            value = new Vec3(value)
        }

        if (this[VALUE] && this[VALUE].equals(value)) {
            return false
        }

        this[OLD_VALUE] = this[VALUE]
        this[VALUE] = new Vec3(value)

        this.emit('updated', this[VALUE], this[OLD_VALUE], event)

        return true
    }

}
