import {doc, section, text, code} from '../../../doc/runtime.js'
import {DECAL_SHADER_DEF} from './decal_shader.js'


export default doc('Decal Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for rendering decals. Decals are textured
        quads projected onto surfaces, commonly used for bullet holes,
        splatter effects, and surface details.
    `)


    section('Vertex Shader', () => {

        text(`
            Standard model-view-projection transform with fog depth output.

            Attributes:
            - \`aPosition\` (vec3) — local position
            - \`aTexCoord\` (vec2) — texture UV coordinates

            Uniforms:
            - \`uProjection\` (mat4) — projection matrix
            - \`uView\` (mat4) — view matrix
            - \`uModel\` (mat4) — model matrix
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Samples an optional texture with alpha testing. Fragments
            with alpha below 0.01 are discarded. Applies color, emissive,
            opacity, and distance fog.

            Uniforms:
            - \`uTexture\` — diffuse texture
            - \`uHasTexture\` (float) — 1.0 if textured
            - \`uColor\` (vec3) — base color multiplier
            - \`uEmissive\` (vec3) — additive emissive color
            - \`uOpacity\` (float) — alpha multiplier
            - \`uFogNear\`, \`uFogFar\` (float) — fog distance range
            - \`uFogColor\` (vec3) — fog color
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`DECAL_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = DECAL_SHADER_DEF.uniforms
        })

    })

})
