import {doc, section, text, code} from '../../../doc/runtime.js'
import {SHADOW_SHADER_DEF} from './shadow_shader.js'


export default doc('Shadow Shader', {advanced: true}, () => {

    text(`
        Built-in GLSL shader for rendering sprite shadows. Used by
        [[ShadowTransform@render/transforms]] to project sprites as flat,
        skewed silhouettes beneath the original objects.
    `)


    section('Vertex Shader', () => {

        text(`
            Distorts each vertex relative to its anchor Y position to create
            the shadow projection:

            - \`uShadowSkewX\` — horizontal shear based on distance from anchor
            - \`uShadowScaleY\` — vertical squash factor
            - \`uShadowOffsetY\` — vertical displacement

            The \`aAnchorY\` attribute provides the world-space anchor so the
            shadow stays grounded at the sprite's feet.
        `)

    })


    section('Fragment Shader', () => {

        text(`
            Samples the sprite texture for its alpha channel only. The output
            color is \`uShadowColor\` with alpha multiplied by the texture
            alpha and vertex opacity. This produces a uniform-color silhouette
            that respects the sprite's shape.
        `)

    })


    section('Shader Definition', () => {

        text(`
            \`SHADOW_SHADER_DEF\` bundles vertex source, fragment source,
            uniform names, and attribute names.
        `)

        code('Shadow uniforms', () => {
            const uniforms = SHADOW_SHADER_DEF.uniforms
        })

    })

})
