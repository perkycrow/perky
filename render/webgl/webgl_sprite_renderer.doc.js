import {doc, section, text, code} from '../../doc/runtime.js'
import WebGLSpriteRenderer from './webgl_sprite_renderer.js'


export default doc('WebGLSpriteRenderer', {advanced: true}, () => {

    text(`
        WebGL renderer for [[Sprite@render]] objects. Groups sprites by their
        active shader effects and draws each group in a single batched call
        via [[WebGLSpriteBatch@render/webgl]].

        Registered automatically — sprites in the scene graph are routed here
        by the renderer registry when using the WebGL backend.
    `)


    section('Effect Batching', () => {

        text(`
            Sprites are grouped by their combination of active
            [[ShaderEffect@render/shaders]] types. Each unique combination gets
            its own compiled program from the [[ShaderEffectRegistry@render/shaders]],
            so sprites with the same effects share a single draw call.

            Sprites with no effects use the default sprite shader.
        `)

    })


    section('Render Transforms', () => {

        text(`
            When a [[RenderGroup@render]] has a render transform (e.g. shadow
            projection), the transform's program overrides effect-based program
            selection. The transform can also inject its own uniforms before
            the batch is flushed.
        `)

    })


    section('Disposal', () => {

        text(`
            \`dispose()\` cleans up the internal sprite batch and nulls the
            shader effect registry reference.
        `)

    })

})
