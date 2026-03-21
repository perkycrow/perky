import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Vec3 from '../math/vec3.js'
import {
    boxWirePositions,
    sphereWirePositions,
    cylinderWirePositions,
    coneWirePositions,
    brushWirePositions
} from './wire_geometry.js'


export default doc('Wire Geometry', () => {

    text(`
        Generates wireframe line data for basic 3D shapes.
        Used by the Forge editor to display brush outlines.
    `)


    section('Box Wireframe', () => {

        text(`
            \`boxWirePositions\` generates 12 edges for an axis-aligned box.
            Returns a Float32Array with line segment positions.
        `)

        action('Generate box', () => {
            const position = new Vec3(0, 0, 0)
            const scale = new Vec3(2, 2, 2)
            const positions = boxWirePositions(position, scale)

            logger.log('Position:', position.x, position.y, position.z)
            logger.log('Scale:', scale.x, scale.y, scale.z)
            logger.log('Total floats:', positions.length)
            logger.log('Edges:', positions.length / 6)
        })

    })


    section('Sphere Wireframe', () => {

        text(`
            \`sphereWirePositions\` generates three circular rings (XY, XZ, YZ planes).
            The \`segments\` parameter controls smoothness (default: 16).
        `)

        action('Generate sphere', () => {
            const position = new Vec3(0, 0, 0)
            const scale = new Vec3(2, 2, 2)
            const positions = sphereWirePositions(position, scale)

            logger.log('Default segments: 16')
            logger.log('Total floats:', positions.length)
            logger.log('Edges per ring:', positions.length / 6 / 3)
        })

    })


    section('Cylinder Wireframe', () => {

        text(`
            \`cylinderWirePositions\` generates top and bottom circles plus
            four vertical edges connecting them.
        `)

        action('Generate cylinder', () => {
            const position = new Vec3(0, 0, 0)
            const scale = new Vec3(2, 3, 2)
            const positions = cylinderWirePositions(position, scale)

            logger.log('Scale:', scale.x, scale.y, scale.z)
            logger.log('Total floats:', positions.length)
            logger.log('Total edges:', positions.length / 6)
        })

    })


    section('Cone Wireframe', () => {

        text(`
            \`coneWirePositions\` generates a base circle and four edges
            connecting the base to the apex.
        `)

        action('Generate cone', () => {
            const position = new Vec3(0, 0, 0)
            const scale = new Vec3(2, 3, 2)
            const positions = coneWirePositions(position, scale)

            logger.log('Scale:', scale.x, scale.y, scale.z)
            logger.log('Total floats:', positions.length)
            logger.log('Total edges:', positions.length / 6)
        })

    })


    section('Brush Wireframe', () => {

        text(`
            \`brushWirePositions\` dispatches to the appropriate shape function
            based on \`brush.shape\`. Also applies rotation if present.
        `)

        code('Usage', () => {
            // const positions = brushWirePositions({
            //     shape: 'box',
            //     position: new Vec3(0, 0, 0),
            //     scale: new Vec3(2, 2, 2),
            //     rotation: new Vec3(0, Math.PI / 4, 0)
            // })
        })

    })

})
