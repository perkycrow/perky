import {doc, section, text, code} from '../../../doc/runtime.js'
import {CUBE_DEPTH_SHADER_DEF} from './cube_depth_shader.js'


export default doc('Cube Depth Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for omnidirectional shadow mapping. Renders
        depth from a point light's perspective into a cubemap face.
        Outputs linear distance from the light rather than z-depth.
    `)


    section('Vertex Shader', () => {

        text(`
            Transforms vertices to world space and passes world position
            to the fragment shader for distance calculation.

            Attributes:
            - \`aPosition\` (vec3) — local position

            Uniforms:
            - \`uProjection\` (mat4) — projection matrix
            - \`uView\` (mat4) — view matrix for cubemap face
            - \`uModel\` (mat4) — model matrix
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Outputs normalized distance from the light position.
            The distance is divided by the far plane to store a 0-1
            value suitable for shadow comparison.

            Uniforms:
            - \`uLightPosition\` (vec3) — world-space light position
            - \`uFar\` (float) — far plane distance for normalization
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`CUBE_DEPTH_SHADER_DEF\` bundles vertex source, fragment
            source, uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = CUBE_DEPTH_SHADER_DEF.uniforms
        })

    })

})
