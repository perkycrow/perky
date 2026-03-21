import {doc, section, text, code} from '../../../doc/runtime.js'
import {BILLBOARD_SHADER_DEF} from './billboard_shader.js'


export default doc('Billboard Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for camera-facing billboards. Billboards
        always face the camera regardless of world orientation, useful
        for particles, sprites in 3D space, and imposters.
    `)


    section('Vertex Shader', () => {

        text(`
            Reconstructs world position from a center point and size,
            using the view matrix's right and up vectors to ensure the
            quad always faces the camera.

            Attributes:
            - \`aPosition\` (vec3) — local offset from center
            - \`aTexCoord\` (vec2) — texture UV coordinates

            Uniforms:
            - \`uProjection\` (mat4) — projection matrix
            - \`uView\` (mat4) — view matrix
            - \`uCenter\` (vec3) — billboard world position
            - \`uSize\` (vec2) — billboard width and height
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Samples an optional texture and applies color, emissive,
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
            \`BILLBOARD_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = BILLBOARD_SHADER_DEF.uniforms
        })

    })

})
