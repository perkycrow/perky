import {doc, section, text, code} from '../../../doc/runtime.js'
import {MESH_SHADER_DEF} from './mesh_shader.js'


export default doc('Mesh Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for rendering 3D meshes with full lighting.
        Supports directional light, point/spot lights, shadow mapping,
        normal mapping, fog, and vertex colors.
    `)


    section('Vertex Shader', () => {

        text(`
            Transforms position, normal, and tangent to world space.
            Computes light-space position for shadow mapping.

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
            - \`uLightMatrix\` (mat4) — light projection for shadows
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Full PBR-lite lighting model with diffuse, specular, shadows,
            and optional normal mapping. Supports multiple light sources
            via a data texture.

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

            Lighting:
            - \`uLightDirection\` (vec3) — directional light direction
            - \`uAmbient\` (float) — ambient light level
            - \`uNumLights\` (int) — point/spot light count
            - \`uLightData\` (sampler2D) — light data texture

            Shadows:
            - \`uShadowMap\` (sampler2DShadow) — shadow depth map
            - \`uHasShadowMap\` (float) — 1.0 if shadows enabled

            Fog:
            - \`uFogNear\`, \`uFogFar\` (float) — fog distance range
            - \`uFogColor\` (vec3) — fog color
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`MESH_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = MESH_SHADER_DEF.uniforms
        })

    })

})
