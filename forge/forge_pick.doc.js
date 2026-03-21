import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Vec3 from '../math/vec3.js'
import {
    screenToRay,
    rayAABB,
    brushAABB,
    pickBrush,
    HANDLE_AXES,
    handlePositions,
    pickHandle,
    rayAxisProject,
    rayHorizontalPlane
} from './forge_pick.js'


export default doc('Forge Pick', () => {

    text(`
        Raycasting utilities for 3D object selection in the Forge editor.
        Converts screen coordinates to world rays and tests intersections
        against brushes, handles, and gizmo elements.
    `)


    section('Screen to Ray', () => {

        text(`
            \`screenToRay\` converts mouse coordinates to a 3D ray.
            Returns an object with \`origin\` and \`direction\` vectors.
        `)

        code('Usage', () => {
            // const {origin, direction} = screenToRay(camera3d, clientX, clientY, canvas)
            //
            // origin    → near plane position in world space
            // direction → normalized ray direction
        })

    })


    section('Ray-AABB Intersection', () => {

        text(`
            \`rayAABB\` tests a ray against an axis-aligned bounding box.
            Returns the distance \`t\` to the intersection, or -1 if no hit.
        `)

        action('Hit detection', () => {
            const origin = new Vec3(0, 0, -5)
            const direction = new Vec3(0, 0, 1)
            const min = new Vec3(-1, -1, -1)
            const max = new Vec3(1, 1, 1)

            const t = rayAABB(origin, direction, min, max)

            logger.log('Ray origin:', origin.x, origin.y, origin.z)
            logger.log('Ray direction:', direction.x, direction.y, direction.z)
            logger.log('Box min:', min.x, min.y, min.z)
            logger.log('Box max:', max.x, max.y, max.z)
            logger.log('Hit distance:', t)
        })

        action('Miss', () => {
            const origin = new Vec3(0, 0, -5)
            const direction = new Vec3(1, 0, 0)
            const min = new Vec3(-1, -1, -1)
            const max = new Vec3(1, 1, 1)

            const t = rayAABB(origin, direction, min, max)

            logger.log('Ray direction (parallel):', direction.x, direction.y, direction.z)
            logger.log('Result:', t === -1 ? 'miss' : `hit at ${t}`)
        })

    })


    section('Brush Selection', () => {

        text(`
            \`brushAABB\` computes the axis-aligned bounding box of a brush.
            \`pickBrush\` finds the closest brush hit by a screen ray.
        `)

        code('Pick a brush', () => {
            // const index = pickBrush({
            //     camera3d,
            //     clientX: event.clientX,
            //     clientY: event.clientY,
            //     canvas,
            //     brushSet
            // })
            //
            // if (index >= 0) {
            //     selectBrush(index)
            // }
        })

    })


    section('Handle Picking', () => {

        text(`
            Handles are small cubes on brush faces for scaling.
            \`handlePositions\` returns the 6 handle positions.
            \`pickHandle\` returns the index of the clicked handle.
        `)

        action('Handle axes', () => {
            for (let i = 0; i < HANDLE_AXES.length; i++) {
                const axis = HANDLE_AXES[i]
                logger.log(`Handle ${i}:`, axis.x, axis.y, axis.z)
            }
        })

        code('Usage', () => {
            // const handleIndex = pickHandle({
            //     camera3d,
            //     clientX,
            //     clientY,
            //     canvas,
            //     brush
            // })
            //
            // Handle indices: 0=+X, 1=-X, 2=+Y, 3=-Y, 4=+Z, 5=-Z
        })

    })


    section('Drag Projection', () => {

        text(`
            \`rayAxisProject\` projects a screen ray onto a world axis.
            Used for dragging objects along a single axis.
        `)

        code('Axis-constrained drag', () => {
            // const offset = rayAxisProject({
            //     origin,
            //     direction,
            //     axisOrigin: brush.position,
            //     axisDir: new Vec3(1, 0, 0),
            //     cameraPos: camera3d.position
            // })
            //
            // brush.position.x = startPosition.x + offset - startOffset
        })

        text(`
            \`rayHorizontalPlane\` intersects a ray with a horizontal plane.
            Returns the hit point or null if the ray is parallel.
        `)

        action('Horizontal plane hit', () => {
            const origin = new Vec3(0, 5, 0)
            const direction = new Vec3(0, -1, 0).normalize()
            const planeY = 0

            const hit = rayHorizontalPlane(origin, direction, planeY)

            logger.log('Origin:', origin.x, origin.y, origin.z)
            logger.log('Direction:', direction.x, direction.y, direction.z)
            logger.log('Plane Y:', planeY)
            if (hit) {
                logger.log('Hit point:', hit.x, hit.y, hit.z)
            }
        })

    })

})
