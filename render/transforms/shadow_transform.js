import RenderTransform from '../render_transform'
import {SHADOW_SHADER_DEF} from '../shaders/builtin/shadow_shader'


export default class ShadowTransform extends RenderTransform {

    #program = null


    constructor (options = {}) {
        super(options)

        this.skewX = options.skewX ?? 0.5
        this.scaleY = options.scaleY ?? 0.5
        this.offsetY = options.offsetY ?? 0
        this.color = options.color ?? [0, 0, 0, 0.4]
    }


    init (context) {
        this.#program = context.shaderRegistry.register('shadow', SHADOW_SHADER_DEF)
    }


    getProgram () {
        return this.#program
    }


    applyUniforms (gl, program) {
        gl.uniform1f(program.uniforms.uShadowSkewX, this.skewX)
        gl.uniform1f(program.uniforms.uShadowScaleY, this.scaleY)
        gl.uniform1f(program.uniforms.uShadowOffsetY, this.offsetY)
        gl.uniform4fv(program.uniforms.uShadowColor, this.color)
    }


    getPropertyConfig () {
        return this.constructor.propertyConfig
    }


    static propertyConfig = {
        skewX: {min: -2, max: 2, step: 0.05},
        scaleY: {min: -1, max: 0, step: 0.05},
        offsetY: {min: -0.5, max: 0.5, step: 0.01},
        color: {type: 'color'}
    }


    dispose () {
        this.#program = null
    }

}
