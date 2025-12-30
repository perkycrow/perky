import RenderTransform from '../render_transform'
import {SHADOW_SHADER_DEF} from '../shaders/builtin/shadow_shader'


export const SHADOW_MODE = {
    directional: 0,
    pointLight: 1
}


/**
 * Transform that renders objects as projected shadows.
 * Supports two modes:
 * - directional: Sun-like shadows where all sprites have the same shadow angle
 * - pointLight: Per-sprite shadow angles based on light position
 *
 * @example
 * // Directional mode (sun-like)
 * new ShadowTransform({
 *     mode: 'directional',
 *     skewX: 0.5,
 *     scaleY: 0.5,
 *     color: [0, 0, 0, 0.4]
 * })
 *
 * @example
 * // Point light mode (per-sprite angles)
 * new ShadowTransform({
 *     mode: 'pointLight',
 *     lightPosition: [2, 1],
 *     lightHeight: 3,
 *     color: [0, 0, 0, 0.4]
 * })
 */
export default class ShadowTransform extends RenderTransform {

    #program = null


    constructor (options = {}) {
        super(options)

        // Shadow mode: 'directional' or 'pointLight'
        this.mode = options.mode ?? 'directional'

        // Directional mode parameters
        this.skewX = options.skewX ?? 0.5
        this.scaleY = options.scaleY ?? 0.5

        // Point light mode parameters
        this.lightPosition = options.lightPosition ?? [0, 0]
        this.lightHeight = options.lightHeight ?? 3

        // Common parameters
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
        const modeValue = this.mode === 'pointLight' ? SHADOW_MODE.pointLight : SHADOW_MODE.directional

        gl.uniform1i(program.uniforms.uShadowMode, modeValue)
        gl.uniform1f(program.uniforms.uShadowOffsetY, this.offsetY)
        gl.uniform4fv(program.uniforms.uShadowColor, this.color)

        if (modeValue === SHADOW_MODE.directional) {
            gl.uniform1f(program.uniforms.uShadowSkewX, this.skewX)
            gl.uniform1f(program.uniforms.uShadowScaleY, this.scaleY)
        } else {
            gl.uniform2fv(program.uniforms.uLightPosition, this.lightPosition)
            gl.uniform1f(program.uniforms.uLightHeight, this.lightHeight)
        }
    }


    dispose () {
        this.#program = null
    }

}
