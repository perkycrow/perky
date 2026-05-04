import {doc, section, text, code} from '../../../doc/runtime.js'
import {OUTLINE_SHADER_DEF} from './outline_shader.js'


export default doc('Outline Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for screen-space edge detection. Detects
        edges based on depth and normal discontinuities, with optional
        world-space wobble for a hand-drawn look.
    `)


    section('Vertex Shader', () => {

        text(`
            Fullscreen quad pass-through. Outputs texture coordinates
            for sampling the scene and G-buffer.

            Attributes:
            - \`aPosition\` (vec2) — clip-space position
            - \`aTexCoord\` (vec2) — texture UV coordinates
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Samples depth and normals in a cross pattern to detect edges.
            Depth edges catch silhouettes and object boundaries. Normal
            edges catch surface creases. Both are smoothstepped and combined.

            Scene inputs:
            - \`uSceneColor\` (sampler2D) — rendered scene color
            - \`uDepth\` (sampler2D) — depth buffer
            - \`uGNormal\` (sampler2D) — world-space normals

            Edge detection:
            - \`uTexelSize\` (vec2) — 1/resolution for sampling offsets
            - \`uDepthThreshold\` (float) — sensitivity for depth edges
            - \`uNormalThreshold\` (float) — sensitivity for normal edges
            - \`uOutlineColor\` (vec3) — color of detected edges

            Wobble effect:
            - \`uWobble\` (float) — world-space noise displacement
            - \`uInverseViewProjection\` (mat4) — for world position

            The wobble effect uses value noise based on world position
            to offset sampling coordinates, creating an organic hand-drawn
            appearance. Edge thickness increases with distance from camera.
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`OUTLINE_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Uniforms', () => {
            const uniforms = OUTLINE_SHADER_DEF.uniforms
        })

    })

})
