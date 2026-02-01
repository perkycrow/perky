import {doc, section, text, code} from '../../../doc/runtime.js'
import {SPRITE_SHADER_DEF} from './sprite_shader.js'


export default doc('Sprite Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for drawing textured sprites. Used by
        [[WebGLSpriteRenderer@render/webgl]] through the
        [[WebGLSpriteBatch@render/webgl]]. Handles texture sampling, per-sprite
        opacity, and tint color mixing.
    `)


    section('Vertex Shader', () => {

        text(`
            Transforms positions through model, view, and projection matrices.
            Forwards all per-vertex data to the fragment stage:

            Attributes:
            - \`aPosition\` (vec2) — world-space position
            - \`aTexCoord\` (vec2) — texture UV coordinates
            - \`aOpacity\` (float) — effective opacity
            - \`aTintColor\` (vec4) — RGBA tint color
            - \`aEffectParams\` (vec4) — shader effect parameters
            - \`aUVBounds\` (vec4) — UV region bounds for effect clamping
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Samples the sprite texture and applies tint when \`tintColor.a > 0\`.
            The tint mixes into the RGB channels using the alpha as blend
            factor. Final alpha is the texture alpha multiplied by opacity.

            The [[ShaderEffectRegistry@render/shaders]] can inject additional
            GLSL snippets into a copy of this fragment shader for per-sprite
            effects like outlines or glow.
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`SPRITE_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = SPRITE_SHADER_DEF.uniforms
        })

    })

})
