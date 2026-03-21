import {doc, section, text, code} from '../../../doc/runtime.js'
import {DEPTH_SHADER_DEF} from './depth_shader.js'


export default doc('Depth Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for depth-only rendering. Used for shadow
        map generation where only depth values matter, not color.
    `)


    section('Vertex Shader', () => {

        text(`
            Standard model-view-projection transform. No outputs beyond
            clip-space position.

            Attributes:
            - \`aPosition\` (vec3) — local position

            Uniforms:
            - \`uProjection\` (mat4) — projection matrix
            - \`uView\` (mat4) — view matrix
            - \`uModel\` (mat4) — model matrix
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Outputs white. The actual depth value is written automatically
            by the depth buffer. This shader exists to satisfy the
            requirement for a fragment stage while rendering to depth-only
            framebuffers.
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`DEPTH_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = DEPTH_SHADER_DEF.uniforms
        })

    })

})
