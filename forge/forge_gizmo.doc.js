import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Vec3 from '../math/vec3.js'
import {
    GIZMO_LENGTH,
    GIZMO_THICKNESS,
    GIZMO_AXES,
    gizmoArrowPositions,
    pickGizmoArrow
} from './forge_gizmo.js'


export default doc('Forge Gizmo', () => {

    text(`
        Translation gizmo for 3D object manipulation in the Forge editor.
        Provides axis-aligned arrows for moving objects along X, Y, and Z axes.
    `)


    section('Constants', () => {

        text('Configuration values for gizmo rendering and picking.')

        action('Gizmo dimensions', () => {
            logger.log('Arrow length:', GIZMO_LENGTH)
            logger.log('Arrow thickness:', GIZMO_THICKNESS)
        })

        action('Axis definitions', () => {
            for (const {axis, color} of GIZMO_AXES) {
                logger.log(`Axis (${axis.x}, ${axis.y}, ${axis.z}) → color:`, color)
            }
        })

    })


    section('Arrow Positions', () => {

        text(`
            \`gizmoArrowPositions\` generates vertex data for the three axis arrows.
            Returns a Float32Array with 6 positions (2 per axis × 3 axes).
        `)

        action('Generate positions', () => {
            const center = new Vec3(0, 0, 0)
            const positions = gizmoArrowPositions(center)

            logger.log('Total floats:', positions.length)
            logger.log('Vertices per axis:', 2)

            for (let i = 0; i < 3; i++) {
                const base = i * 6
                const start = `(${positions[base]}, ${positions[base + 1]}, ${positions[base + 2]})`
                const end = `(${positions[base + 3]}, ${positions[base + 4]}, ${positions[base + 5]})`
                logger.log(`Axis ${i}: ${start} → ${end}`)
            }
        })

        action('Custom center', () => {
            const center = new Vec3(5, 10, 0)
            const positions = gizmoArrowPositions(center)

            logger.log('Center:', center.x, center.y, center.z)
            logger.log('X arrow end:', positions[3], positions[4], positions[5])
        })

    })


    section('Picking', () => {

        text(`
            \`pickGizmoArrow\` performs ray-AABB intersection to detect which
            arrow the user clicked. Returns the axis index (0=X, 1=Y, 2=Z)
            or -1 if no arrow was hit.
        `)

        code('Usage', () => {
            // const axisIndex = pickGizmoArrow({
            //     camera3d,
            //     clientX: event.clientX,
            //     clientY: event.clientY,
            //     canvas,
            //     center: selectedObject.position
            // })
            //
            // if (axisIndex >= 0) {
            //     startDrag(axisIndex)
            // }
        })

    })

})
