import Vec2Control from './vec2_control'
import Vec2 from '../../math/vec2'


export default class StickControl extends Vec2Control {

    deadzone = 0.1
    noiseThreshold = 0.01
    enableDenoising = true


    constructor (params = {}) {
        super({
            ...params,
            normalize: true,
            range: {min: -1, max: 1}
        })
        this.deadzone = params.deadzone ?? 0.1
        this.noiseThreshold = params.noiseThreshold ?? 0.01
        this.enableDenoising = params.enableDenoising ?? true
    }


    setValue (value) {
        super.setValue(value)
        
        if (this.enableDenoising) {
            this.denoise()
        }
        
        this.applyDeadzone()
    }


    denoise () {
        if (!this.value) {
            return
        }

        const x = Math.abs(this.value.x) < this.noiseThreshold ? 0 : this.value.x
        const y = Math.abs(this.value.y) < this.noiseThreshold ? 0 : this.value.y
        
        super.setValue(new Vec2(x, y))
    }


    applyDeadzone () {
        if (this.value && this.value.length() < this.deadzone) {
            super.setValue(new Vec2(0, 0))
        }
    }

}
