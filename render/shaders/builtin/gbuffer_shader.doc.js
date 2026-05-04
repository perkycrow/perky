import {doc, section, text, code} from '../../../doc/runtime.js'
import {GBUFFER_SHADER_DEF} from './gbuffer_shader.js'


export default doc('G-Buffer Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for deferred rendering's geometry pass.
        Outputs multiple render targets (MRT) containing albedo, normals,
        and material properties for later lighting calculations.
    `)


    section('Vertex Shader', () => {

        text(`
            Transforms position, normal, and tangent to world space.
            Passes through texture coordinates and vertex colors.

            Attributes:
            - \`aPosition\` (vec3) — local position
            - \`aNormal\` (vec3) — local normal
            - \`aTexCoord\` (vec2) — texture UV coordinates
            - \`aTangent\` (vec3) — local tangent for normal mapping
            - \`aColor\` (vec3) — vertex color

            Uniforms:
            - \`uProjection\` (mat4) — projection matrix
            - \`uView\` (mat4) — view matrix
            - \`uModel\` (mat4) — model matrix
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Outputs to three render targets for deferred shading:

            \`gAlbedo\` (location 0):
            - RGB: base color (texture × material × vertex colors)
            - A: opacity

            \`gNormal\` (location 1):
            - RGB: world-space normal (encoded 0-1)
            - A: unlit flag

            \`gMaterial\` (location 2):
            - R: roughness
            - G: specular intensity
            - B: emissive strength

            Material uniforms:
            - \`uMaterialColor\` (vec3) — base color
            - \`uMaterialEmissive\` (vec3) — emissive color
            - \`uMaterialOpacity\` (float) — alpha
            - \`uRoughness\` (float) — specular roughness
            - \`uSpecular\` (float) — specular intensity
            - \`uUnlit\` (float) — bypass lighting

            Texturing:
            - \`uTexture\` — diffuse texture
            - \`uHasTexture\` (float) — 1.0 if textured
            - \`uNormalMap\` — normal map texture
            - \`uHasNormalMap\` (float) — 1.0 if has normal map
            - \`uNormalStrength\` (float) — normal map intensity
            - \`uUVScale\` (vec2) — UV tiling
            - \`uHasVertexColors\` (float) — 1.0 if using vertex colors
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`GBUFFER_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = GBUFFER_SHADER_DEF.uniforms
        })

    })

})
