import InputControl from '../input_control'
import Vec2 from '../../math/vec2'


export default class Vec2Control extends InputControl {

    normalize = false
    range = {min: -1, max: 1}


    constructor (params = {}) {
        super({...params, defaultValue: new Vec2(0, 0)})
        this.normalize = params.normalize ?? false
        this.range = params.range ?? {min: -1, max: 1}
    }


    getDefaultValue () { // eslint-disable-line class-methods-use-this
        return new Vec2(0, 0)
    }


    setValue (value) {
        const vec = new Vec2(value)

        if (this.normalize) {
            const {min, max} = this.range
            vec.x = Math.max(min, Math.min(max, vec.x))
            vec.y = Math.max(min, Math.min(max, vec.y))
        }

        super.setValue(vec)
    }


    get x () {
        return this.value?.x || 0
    }


    get y () {
        return this.value?.y || 0
    }


    get magnitude () {
        return this.value?.length() || 0
    }


    get normalized () {
        if (!this.value || this.value.length() === 0) {
            return new Vec2(0, 0)
        }
        return this.value.clone().normalize()
    }

}
