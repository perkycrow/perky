import {doc, section, text, code} from '../../../doc/runtime.js'
import {SKYBOX_SHADER_DEF} from './skybox_shader.js'


export default doc('Skybox Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for rendering skyboxes. Supports both
        cubemap textures and procedural gradient skies.
    `)


    section('Vertex Shader', () => {

        text(`
            Uses rotation-only view matrix (no translation) so the skybox
            appears infinitely far away. Sets depth to maximum to render
            behind all other geometry.

            Attributes:
            - \`aPosition\` (vec3) — cube vertex position

            Uniforms:
            - \`uProjection\` (mat4) — projection matrix
            - \`uViewRotation\` (mat4) — view rotation only
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Two rendering modes based on \`uHasCubemap\`:

            Cubemap mode: samples the cubemap using the view direction.

            Gradient mode: blends between sky, horizon, and ground colors
            based on the vertical direction component.

            Uniforms:
            - \`uHasCubemap\` (float) — 1.0 for cubemap mode
            - \`uCubemap\` (samplerCube) — cubemap texture
            - \`uSkyColor\` (vec3) — color at zenith
            - \`uHorizonColor\` (vec3) — color at horizon
            - \`uGroundColor\` (vec3) — color at nadir
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`SKYBOX_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = SKYBOX_SHADER_DEF.uniforms
        })

    })

})
