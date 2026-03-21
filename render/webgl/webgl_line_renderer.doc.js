import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('WebGLLineRenderer', {advanced: true}, () => {

    text(`
        WebGL renderer for [[Line@render]] objects. Extends
        [[WebGLPrimitiveRenderer@render/webgl]] to draw lines as
        screen-aligned quads with configurable width.

        Registered automatically — lines in the scene graph are routed here
        by the renderer registry when using the WebGL backend.
    `)


    section('How It Works', () => {

        text(`
            Lines are rendered as thin quads oriented perpendicular to the
            line direction. The quad width is determined by the line's
            \`lineWidth\` property. This approach avoids WebGL's native line
            rendering limitations (inconsistent widths across browsers).
        `)

    })


    section('World Transform', () => {

        text(`
            The line's \`worldMatrix\` positions the start point. The end point
            is computed from \`x2\` and \`y2\` properties transformed by the
            same matrix. This allows lines to be children of transformed
            groups.
        `)

    })


    section('Rendering', () => {

        text(`
            Each line creates four vertices forming a quad strip. The color
            and opacity are applied per-vertex, allowing the primitive
            shader to interpolate them correctly.
        `)

    })

})
