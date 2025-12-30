import RenderTransform from '../render_transform'
import {SHADOW_SHADER_DEF} from '../shaders/builtin/shadow_shader'


/**
 * Transform that renders objects as projected shadows.
 * Creates a 2D shadow effect by skewing sprites along one axis.
 *
 * @example
 * new ShadowTransform({
 *     skewX: 0.5,              // Horizontal skew amount (positive = right)
 *     scaleY: 0.5,             // Shadow is half the height
 *     offsetY: 0,              // Shadow vertical offset
 *     color: [0, 0, 0, 0.4]    // Semi-transparent black
 * })
 */
export default class ShadowTransform extends RenderTransform {

    #program = null


    constructor (options = {}) {
        super(options)

        // Horizontal skew amount (in world units, how far the top shifts)
        this.skewX = options.skewX ?? 0.5

        // Vertical scale of the shadow (0.5 = half height)
        this.scaleY = options.scaleY ?? 0.5

        // Vertical offset (in world units)
        this.offsetY = options.offsetY ?? 0

        // Shadow color [r, g, b, a] (0-1 range)
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


    dispose () {
        this.#program = null
    }

}
