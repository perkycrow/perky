import {doc, section, text, code} from '../../../doc/runtime.js'
import {SPRITE3D_GBUFFER_SHADER_DEF} from './sprite3d_gbuffer_shader.js'


export default doc('Sprite3D G-Buffer Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for rendering 3D sprites into the G-buffer.
        Sprites face the camera horizontally while remaining upright,
        with subtle camera-aware tilt when viewed from above.
    `)


    section('Vertex Shader', () => {

        text(`
            Constructs a camera-facing quad that stays upright (Y-axis aligned)
            while rotating to face the camera horizontally. Applies a subtle
            tilt based on camera angle and proximity.

            Attributes:
            - \`aPosition\` (vec3) — local position (used for offset)
            - \`aTexCoord\` (vec2) — texture UV coordinates

            Transform uniforms:
            - \`uProjection\` (mat4) — projection matrix
            - \`uView\` (mat4) — view matrix
            - \`uCenter\` (vec3) — sprite world position
            - \`uSize\` (vec2) — sprite width and height
            - \`uAnchor\` (vec2) — anchor point offset

            Depth is calculated from the sprite center rather than per-vertex
            to ensure correct sorting with other 3D objects.
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Outputs to G-buffer with alpha testing. The normal always points
            toward the camera based on the billboarded orientation.

            Outputs:
            - \`gAlbedo\` (location 0): RGB color, A opacity
            - \`gNormal\` (location 1): world normal (encoded), unlit flag
            - \`gMaterial\` (location 2): roughness, specular, emissive, double-sided flag

            Material uniforms:
            - \`uTexture\` — diffuse texture
            - \`uHasTexture\` (float) — 1.0 if textured
            - \`uMaterialColor\` (vec3) — color multiplier
            - \`uMaterialEmissive\` (vec3) — emissive color
            - \`uRoughness\` (float) — surface roughness
            - \`uSpecular\` (float) — specular intensity
            - \`uUnlit\` (float) — bypass lighting
            - \`uAlphaThreshold\` (float) — alpha test cutoff
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`SPRITE3D_GBUFFER_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = SPRITE3D_GBUFFER_SHADER_DEF.uniforms
        })

    })

})
