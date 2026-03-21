import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Vec3 from '../math/vec3.js'
import {
    ROTATION_RING_RADIUS,
    ROTATION_RING_SEGMENTS,
    ROTATION_RING_TOLERANCE,
    ROTATION_AXES,
    rotationRingPositions,
    pickRotationRing,
    rayPlaneAngle,
    applyWireRotation
} from './forge_rotation_gizmo.js'


export default doc('Forge Rotation Gizmo', () => {

    text(`
        Rotation gizmo for 3D object manipulation in the Forge editor.
        Displays three circular rings for rotating around X, Y, and Z axes.
    `)


    section('Constants', () => {

        text('Configuration values for ring rendering and picking.')

        action('Ring dimensions', () => {
            logger.log('Ring radius:', ROTATION_RING_RADIUS)
            logger.log('Ring segments:', ROTATION_RING_SEGMENTS)
            logger.log('Pick tolerance:', ROTATION_RING_TOLERANCE)
        })

        action('Axis definitions', () => {
            for (const {axis, color, u, v} of ROTATION_AXES) {
                logger.log(`Axis (${axis.x}, ${axis.y}, ${axis.z}):`)
                logger.log(`  color: [${color.join(', ')}]`)
                logger.log(`  u: (${u.x}, ${u.y}, ${u.z})`)
                logger.log(`  v: (${v.x}, ${v.y}, ${v.z})`)
            }
        })

    })


    section('Ring Positions', () => {

        text(`
            \`rotationRingPositions\` generates line segment data for the three rings.
            Each ring is approximated with line segments around its circumference.
        `)

        action('Generate positions', () => {
            const center = new Vec3(0, 0, 0)
            const positions = rotationRingPositions(center)

            const verticesPerRing = ROTATION_RING_SEGMENTS * 2
            const floatsPerRing = verticesPerRing * 3

            logger.log('Total floats:', positions.length)
            logger.log('Floats per ring:', floatsPerRing)
            logger.log('Segments per ring:', ROTATION_RING_SEGMENTS)
        })

        action('Custom radius', () => {
            const center = new Vec3(0, 0, 0)
            const radius = 2.0
            const positions = rotationRingPositions(center, radius)

            logger.log('Custom radius:', radius)
            logger.log('First vertex X:', positions[0].toFixed(2))
        })

    })


    section('Picking', () => {

        text(`
            \`pickRotationRing\` detects which ring the user clicked.
            Returns the axis index (0=X, 1=Y, 2=Z) or -1 if no ring was hit.
        `)

        code('Usage', () => {
            // const axisIndex = pickRotationRing({
            //     camera3d,
            //     clientX: event.clientX,
            //     clientY: event.clientY,
            //     canvas,
            //     center: selectedObject.position
            // })
            //
            // if (axisIndex >= 0) {
            //     startRotation(axisIndex)
            // }
        })

    })


    section('Rotation Interaction', () => {

        text(`
            \`rayPlaneAngle\` projects a screen ray onto the rotation plane
            and returns the angle in radians. Used to track rotation delta
            during drag operations.
        `)

        code('Track rotation', () => {
            // const startAngle = rayPlaneAngle({
            //     origin, direction,
            //     center: object.position,
            //     axisIndex: 1  // Y axis
            // })
            //
            // // During drag:
            // const currentAngle = rayPlaneAngle({origin, direction, center, axisIndex})
            // const delta = currentAngle - startAngle
        })

    })


    section('Wire Rotation', () => {

        text(`
            \`applyWireRotation\` transforms wireframe positions by a rotation.
            Rotates all vertices around a center point using Euler angles.
        `)

        action('Apply rotation', () => {
            const positions = new Float32Array([
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ])

            const center = new Vec3(0, 0, 0)
            const rotation = new Vec3(0, Math.PI / 4, 0)

            logger.log('Before rotation:')
            for (let i = 0; i < 3; i++) {
                logger.log(`  v${i}: (${positions[i * 3].toFixed(2)}, ${positions[i * 3 + 1].toFixed(2)}, ${positions[i * 3 + 2].toFixed(2)})`)
            }

            applyWireRotation(positions, center, rotation)

            logger.log('After 45° Y rotation:')
            for (let i = 0; i < 3; i++) {
                logger.log(`  v${i}: (${positions[i * 3].toFixed(2)}, ${positions[i * 3 + 1].toFixed(2)}, ${positions[i * 3 + 2].toFixed(2)})`)
            }
        })

    })

})
