import InputControl from '../input_control'
import Vec3 from '../../math/vec3'


export default class Vec3Control extends InputControl {

    normalize = false
    range = {min: -1, max: 1}


    constructor (params = {}) {
        super({...params, defaultValue: new Vec3(0, 0, 0)})
        this.normalize = params.normalize ?? false
        this.range = params.range ?? {min: -1, max: 1}
    }


    getDefaultValue () { // eslint-disable-line class-methods-use-this
        return new Vec3(0, 0, 0)
    }


    setValue (value) {
        const vec = new Vec3(value)

        if (this.normalize) {
            const {min, max} = this.range
            vec.x = Math.max(min, Math.min(max, vec.x))
            vec.y = Math.max(min, Math.min(max, vec.y))
            vec.z = Math.max(min, Math.min(max, vec.z))
        }

        super.setValue(vec)
    }


    get x () {
        return this.value?.x || 0
    }


    get y () {
        return this.value?.y || 0
    }


    get z () {
        return this.value?.z || 0
    }


    get magnitude () {
        return this.value?.length() || 0
    }


    get normalized () {
        if (!this.value || this.value.length() === 0) {
            return new Vec3(0, 0, 0)
        }
        return this.value.clone().normalize()
    }

}
