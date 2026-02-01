import {doc, section, text, code} from '../../doc/runtime.js'
import ShaderProgram from './shader_program.js'


export default doc('ShaderProgram', {advanced: true}, () => {

    text(`
        Thin wrapper around a WebGL2 shader program. Compiles vertex and fragment
        shaders, links them, and provides methods to register and set uniforms
        and attributes. All setter methods return \`this\` for chaining.
    `)


    section('Creating a Program', () => {

        text(`
            Pass a WebGL2 context and GLSL source strings. The constructor
            compiles and links immediately — errors throw.
        `)

        code('Basic creation', () => {
            const vertex = `#version 300 es
                in vec2 aPosition;
                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);
                }`

            const fragment = `#version 300 es
                precision mediump float;
                out vec4 fragColor;
                void main() {
                    fragColor = vec4(1.0, 0.0, 0.0, 1.0);
                }`

            const program = new ShaderProgram(gl, vertex, fragment)

            program.registerUniform('uColor')
            program.registerAttribute('aPosition')

            program.use()
            program.setUniform3f('uColor', 1.0, 0.0, 0.0)
        })

    })


    section('Uniforms and Attributes', () => {

        text(`
            Register uniforms and attributes by name to cache their locations.
            Then use the typed setters to update values:

            - \`setUniform1f\` — single float
            - \`setUniform2f\` — vec2
            - \`setUniform3f\` — vec3
            - \`setUniform4f\` — vec4 (array)
            - \`setUniform1i\` — integer (samplers, booleans)
            - \`setUniformMatrix3fv\` — mat3
            - \`setUniformMatrix4fv\` — mat4
        `)

        code('Register and set', () => {
            const program = new ShaderProgram(gl, vertexSrc, fragmentSrc)

            program
                .registerUniform('uProjection')
                .registerUniform('uTime')
                .registerAttribute('aPosition')
                .registerAttribute('aTexCoord')

            program.use()
            program.setUniformMatrix3fv('uProjection', false, projectionMatrix)
            program.setUniform1f('uTime', 0.5)
        })

    })


    section('Disposal', () => {

        text(`
            Call \`dispose()\` to delete the underlying WebGL program and clear
            all cached locations. The instance is unusable after disposal.
        `)

        code('Clean up', () => {
            const program = new ShaderProgram(gl, vertexSrc, fragmentSrc)
            program.dispose()
        })

    })

})
