import WebGLObjectRenderer from './webgl_object_renderer.js'
import WebGLSpriteBatch from './webgl_sprite_batch.js'
import Image2D from '../image_2d.js'
import Sprite from '../sprite.js'


export default class WebGLSpriteRenderer extends WebGLObjectRenderer {

    #spriteBatch = null
    #shaderEffectRegistry = null

    static get handles () {
        return [Image2D, Sprite]
    }


    init (context) {
        super.init(context)
        this.#spriteBatch = new WebGLSpriteBatch(
            context.gl,
            context.spriteProgram,
            context.textureManager
        )
        this.#shaderEffectRegistry = context.shaderEffectRegistry
    }


    reset (renderContext = null) {
        super.reset()
        const program = renderContext?.transform?.getProgram() || null
        this.#spriteBatch.begin(program)
    }


    flush (matrices, renderContext = null) {
        const gl = this.gl
        const transform = renderContext?.transform
        const identityMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]

        const batches = this.#groupByShaderEffects()

        for (const [effectKey, items] of batches) {
            const program = this.#getProgramForEffects(effectKey, transform)

            this.#spriteBatch.begin(program)

            for (const {object, opacity, hints} of items) {
                this.#spriteBatch.addSprite(object, opacity, hints)
            }

            gl.useProgram(program.program)
            gl.uniformMatrix3fv(program.uniforms.uProjectionMatrix, false, matrices.projectionMatrix)
            gl.uniformMatrix3fv(program.uniforms.uViewMatrix, false, matrices.viewMatrix)
            gl.uniformMatrix3fv(program.uniforms.uModelMatrix, false, identityMatrix)

            setEffectUniforms(gl, program, this.#spriteBatch.currentTextureSize)

            if (this.#shaderEffectRegistry) {
                this.#shaderEffectRegistry.applyUniforms(gl, program)
            }

            if (transform) {
                transform.applyUniforms(gl, program, matrices)
            }

            this.#spriteBatch.end(program)
        }
    }


    #groupByShaderEffects () {
        const batches = new Map()

        for (const item of this.collected) {
            const effectTypes = item.hints?.shaderEffectTypes || []
            const key = [...effectTypes].sort().join('|')

            if (!batches.has(key)) {
                batches.set(key, [])
            }
            batches.get(key).push(item)
        }

        return batches
    }


    #getProgramForEffects (effectKey, transform) {
        if (transform?.getProgram()) {
            return transform.getProgram()
        }

        if (!effectKey || !this.#shaderEffectRegistry) {
            return this.context.spriteProgram
        }

        const effectTypes = effectKey.split('|').filter(Boolean)

        if (effectTypes.length === 0) {
            return this.context.spriteProgram
        }

        return this.#shaderEffectRegistry.getShaderForEffects(effectTypes)
    }


    dispose () {
        if (this.#spriteBatch) {
            this.#spriteBatch.dispose()
            this.#spriteBatch = null
        }
        this.#shaderEffectRegistry = null
        super.dispose()
    }

}


function setEffectUniforms (gl, program, textureSize) {
    const uTexelSize = program.uniforms.uTexelSize
    if (uTexelSize !== undefined && uTexelSize !== -1) {
        gl.uniform2f(uTexelSize, 1.0 / textureSize.width, 1.0 / textureSize.height)
    }
}
