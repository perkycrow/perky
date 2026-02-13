import {doc, section, text, code} from '../../../doc/runtime.js'
import {PRIMITIVE_SHADER_DEF} from './primitive_shader.js'


export default doc('Primitive Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for drawing geometric primitives (circles,
        rectangles, debug gizmos). Used by [[WebGLPrimitiveRenderer@render/webgl]]
        and [[WebGLDebugGizmoRenderer@render/webgl]].
    `)


    section('Vertex Shader', () => {

        text(`
            Transforms 2D positions through view and projection matrices.
            Passes per-vertex color (RGBA) to the fragment stage.

            Attributes:
            - \`aPosition\` (vec2) — world-space position
            - \`aColor\` (vec4) — RGBA color with alpha as opacity

            Uniforms:
            - \`uProjectionMatrix\` (mat3)
            - \`uViewMatrix\` (mat3)
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Outputs the interpolated vertex color directly. No texturing,
            no lighting — just flat colored geometry.
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`PRIMITIVE_SHADER_DEF\` bundles the vertex source, fragment source,
            uniform names, and attribute names. Pass it to
            [[ShaderRegistry@render/shaders]] to compile the program.
        `)

        code('Using the definition', () => {
            const program = shaderRegistry.register('primitive', PRIMITIVE_SHADER_DEF)
        })

    })

})
