import {doc, section, text} from '../../doc/runtime.js'
import WebGLDebugGizmoRenderer from './webgl_debug_gizmo_renderer.js'


export default doc('WebGLDebugGizmoRenderer', {advanced: true}, () => {

    text(`
        Renders debug overlays for scene objects in WebGL: bounding boxes,
        anchor points, pivot points, and local axes. Uses the primitive shader
        to draw colored lines and small circles.

        Objects opt in to debug rendering by setting \`debugGizmos\` with
        flags for which gizmos to show.
    `)


    section('Available Gizmos', () => {

        text(`
            - **bounds** — green wireframe rectangle showing the object's bounding box
            - **anchor** — yellow crosshair with a small circle at the anchor position
            - **pivot** — magenta crosshair with an outlined circle at the pivot
            - **origin** — red/green axis lines with a white dot at the transform origin
        `)

    })


    section('Usage', () => {

        text(`
            Gizmo collection is separate from normal rendering. The WebGL
            renderer calls \`collectGizmo(object, opacity)\` for objects that
            have debug gizmos enabled, then \`flush()\` draws them all on top
            of the scene.

            This renderer does not declare any \`handles\` — it is called
            directly by the traversal logic rather than through the registry.
        `)

    })

})
