import InputControl from '../input_control'


export default class FloatControl extends InputControl {

    normalize = false
    range = {min: 0, max: 1}


    constructor (params = {}) {
        super({...params, defaultValue: 0.0})
        this.normalize = params.normalize ?? false
        this.range = params.range ?? {min: 0, max: 1}
    }


    getDefaultValue () { // eslint-disable-line class-methods-use-this
        return 0.0
    }


    setValue (value) {
        let processedValue = parseFloat(value) || 0.0
        
        if (this.normalize) {
            const {min, max} = this.range
            processedValue = Math.max(min, Math.min(max, processedValue))
        }
        
        super.setValue(processedValue)
    }

}
