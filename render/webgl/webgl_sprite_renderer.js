import WebGLObjectRenderer from './webgl_object_renderer'
import WebGLSpriteBatch from '../webgl_sprite_batch'
import Image2D from '../image_2d'
import Sprite2D from '../sprite_2d'


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


    reset () {
        super.reset()
        this.#spriteBatch.begin()
    }


    flush (matrices) {
        // First add all collected sprites to the batch
        for (const {object, opacity, hints} of this.collected) {
            this.#spriteBatch.addSprite(object, opacity, hints)
        }

        const gl = this.gl
        const program = this.context.spriteProgram

        gl.useProgram(program.program)
        gl.uniformMatrix3fv(program.uniforms.projectionMatrix, false, matrices.projectionMatrix)
        gl.uniformMatrix3fv(program.uniforms.viewMatrix, false, matrices.viewMatrix)

        const identityMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]
        gl.uniformMatrix3fv(program.uniforms.modelMatrix, false, identityMatrix)

        this.#spriteBatch.end()
    }


    dispose () {
        if (this.#spriteBatch) {
            this.#spriteBatch.dispose()
            this.#spriteBatch = null
        }
        super.dispose()
    }

}
