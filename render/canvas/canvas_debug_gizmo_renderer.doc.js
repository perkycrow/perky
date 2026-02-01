import {doc, section, text, code} from '../../doc/runtime.js'
import CanvasDebugGizmoRenderer from './canvas_debug_gizmo_renderer.js'


export default doc('CanvasDebugGizmoRenderer', {advanced: true}, () => {

    text(`
        Canvas 2D renderer for debug gizmos (bounds, anchors, pivots, origins).
        Extends [[CanvasObjectRenderer@render/canvas]] and draws visual overlays
        on objects that have \`debugGizmos\` enabled.
    `)


    section('Handled Types', () => {

        text('Returns an empty handles list. Gizmos are collected separately via `collectGizmo` rather than through the standard object type registry.')

        code('Registration', () => {
            CanvasDebugGizmoRenderer.handles // []
        })

    })


    section('Collecting Gizmos', () => {

        text(`
            Unlike standard renderers, gizmo rendering uses a collect-then-flush
            pattern. Objects are added via \`collectGizmo\` and drawn all at once
            during \`flush\`. This ensures gizmos render on top of everything else.
        `)

        code('Collect and flush', () => {
            const renderer = new CanvasDebugGizmoRenderer()

            renderer.collectGizmo(object, 1.0)
            renderer.flush()
            renderer.reset()
        })

    })


    section('Gizmo Types', () => {

        text(`
            Four gizmo types are supported, each toggled independently via the
            object's \`debugGizmos\` property:

            - **bounds** - dashed green rectangle around the object
            - **anchor** - yellow crosshair at the anchor point
            - **pivot** - magenta circle at the pivot point
            - **origin** - red/green axes at the local origin
        `)

    })

})
