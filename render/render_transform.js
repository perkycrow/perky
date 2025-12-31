
export default class RenderTransform {

    constructor (options = {}) {
        this.enabled = options.enabled ?? true
    }


    /**
     * Initialize the transform with WebGL context.
     * Called once when the RenderGroup is installed.
     *
     * @param {Object} context - Render context
     * @param {WebGL2RenderingContext} context.gl - WebGL context
     * @param {ShaderRegistry} context.shaderRegistry - Shader registry
     */
    init () { // eslint-disable-line class-methods-use-this

    }


    /**
     * Apply the transform before rendering.
     * Called before objects are flushed to the screen.
     *
     * @param {Object} context - Render context
     * @param {Object} matrices - Current view/projection matrices
     * @returns {Object} Modified matrices or render state
     */
    apply (context, matrices) {// eslint-disable-line class-methods-use-this
        return matrices
    }


    /**
     * Get a custom shader program for this transform.
     * If null, the default sprite shader is used.
     *
     * @returns {ShaderProgram|null}
     */
    getProgram () { // eslint-disable-line class-methods-use-this
        return null
    }


    /**
     * Apply uniforms to the shader program before rendering.
     *
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} program
     * @param {Object} matrices
     */
    applyUniforms () { // eslint-disable-line class-methods-use-this

    }


    dispose () { // eslint-disable-line class-methods-use-this

    }

}
