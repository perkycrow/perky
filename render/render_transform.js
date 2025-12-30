/**
 * Base class for render transformations.
 * RenderTransforms modify how objects are rendered within a RenderGroup,
 * enabling effects like shadows, reflections, outlines, etc.
 *
 * @example
 * renderer.setRenderGroups([
 *     {
 *         $name: 'shadows',
 *         content: scene,
 *         renderTransform: new ShadowTransform({angle: Math.PI / 6})
 *     },
 *     {
 *         $name: 'entities',
 *         content: scene
 *     }
 * ])
 */
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
    init (context) { // eslint-disable-line no-unused-vars
        // Override in subclasses
    }


    /**
     * Apply the transform before rendering.
     * Called before objects are flushed to the screen.
     *
     * @param {Object} context - Render context
     * @param {Object} matrices - Current view/projection matrices
     * @returns {Object} Modified matrices or render state
     */
    apply (context, matrices) { // eslint-disable-line no-unused-vars
        return matrices
    }


    /**
     * Get a custom shader program for this transform.
     * If null, the default sprite shader is used.
     *
     * @returns {ShaderProgram|null}
     */
    getProgram () {
        return null
    }


    /**
     * Apply uniforms to the shader program before rendering.
     *
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} program
     * @param {Object} matrices
     */
    applyUniforms (gl, program, matrices) { // eslint-disable-line no-unused-vars
        // Override in subclasses
    }


    /**
     * Clean up resources.
     */
    dispose () {
        // Override in subclasses
    }

}
