import {doc, section, text, code} from '../../../doc/runtime.js'
import {WIRE_SHADER_DEF} from './wire_shader.js'


export default doc('Wire Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for rendering wireframe lines. Draws
        geometry as flat-colored lines with uniform opacity.
    `)


    section('Vertex Shader', () => {

        text(`
            Simple view-projection transform with no model matrix.
            Expects pre-transformed world-space positions.

            Attributes:
            - \`aPosition\` (vec3) — world position

            Uniforms:
            - \`uProjection\` (mat4) — projection matrix
            - \`uView\` (mat4) — view matrix
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Outputs a flat color with uniform opacity. No texturing
            or lighting calculations.

            Uniforms:
            - \`uColor\` (vec3) — line color
            - \`uOpacity\` (float) — alpha value
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`WIRE_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = WIRE_SHADER_DEF.uniforms
        })

    })

})
