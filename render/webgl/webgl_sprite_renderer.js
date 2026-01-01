import WebGLObjectRenderer from './webgl_object_renderer.js'
import WebGLSpriteBatch from './webgl_sprite_batch.js'
import Image2D from '../image_2d.js'
import Sprite2D from '../sprite_2d.js'


export default class WebGLSpriteRenderer extends WebGLObjectRenderer {

    #spriteBatch = null


    static get handles () {
        return [Image2D, Sprite2D]
    }


    init (context) {
        super.init(context)
        this.#spriteBatch = new WebGLSpriteBatch(
            context.gl,
            context.spriteProgram,
            context.textureManager
        )
    }


    reset (renderContext = null) {
        super.reset()
        const program = renderContext?.transform?.getProgram() || null
        this.#spriteBatch.begin(program)
    }


    flush (matrices, renderContext = null) {

        for (const {object, opacity, hints} of this.collected) {
            this.#spriteBatch.addSprite(object, opacity, hints)
        }

        const gl = this.gl
        const transform = renderContext?.transform
        const program = transform?.getProgram() || this.context.spriteProgram

        gl.useProgram(program.program)
        gl.uniformMatrix3fv(program.uniforms.uProjectionMatrix, false, matrices.projectionMatrix)
        gl.uniformMatrix3fv(program.uniforms.uViewMatrix, false, matrices.viewMatrix)

        const identityMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]
        gl.uniformMatrix3fv(program.uniforms.uModelMatrix, false, identityMatrix)


        if (transform) {
            transform.applyUniforms(gl, program, matrices)
        }

        this.#spriteBatch.end(program)
    }


    dispose () {
        if (this.#spriteBatch) {
            this.#spriteBatch.dispose()
            this.#spriteBatch = null
        }
        super.dispose()
    }

}
