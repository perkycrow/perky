import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Light3D from './light_3d.js'


export default doc('Light3D', () => {

    text(`
        3D light source for WebGL rendering. Supports point lights and spotlights
        with customizable color, intensity, radius, and falloff.
    `)


    section('Creation', () => {

        text('Create lights with position, color, and intensity.')

        code('Point light', () => {
            const light = new Light3D({
                x: 0,
                y: 5,
                z: 0,
                color: [1, 1, 1],
                intensity: 1,
                radius: 10
            })
        })

        code('Spotlight', () => {
            const light = new Light3D({
                x: 0,
                y: 5,
                z: 0,
                color: [1, 0.9, 0.8],
                intensity: 2,
                direction: [0, -1, 0],
                angle: 45,
                penumbra: 0.2
            })
        })

    })


    section('Position', () => {

        text('Position is stored as a Vec3.')

        action('Position access', () => {
            const light = new Light3D({x: 10, y: 20, z: 30})
            logger.log('x:', light.position.x)
            logger.log('y:', light.position.y)
            logger.log('z:', light.position.z)

            light.position.set(5, 10, 15)
            logger.log('after set:', light.position.x, light.position.y, light.position.z)
        })

    })


    section('Color and Intensity', () => {

        text('Color is an RGB array [0-1], intensity multiplies the output.')

        action('Color and intensity', () => {
            const light = new Light3D({
                color: [1, 0.5, 0],
                intensity: 2
            })
            logger.log('color:', light.color)
            logger.log('intensity:', light.intensity)

            light.intensity = 0.5
            logger.log('after change:', light.intensity)
        })

    })


    section('Radius', () => {

        text('Radius controls the light falloff distance.')

        action('Radius access', () => {
            const light = new Light3D({radius: 15})
            logger.log('radius:', light.radius)

            light.radius = 25
            logger.log('after change:', light.radius)
        })

    })


    section('Spotlight Properties', () => {

        text(`
            Set a direction to make the light a spotlight. The angle controls
            the cone width, and penumbra softens the edge.
        `)

        action('Direction and angle', () => {
            const light = new Light3D({
                direction: [0, -1, 0.5],
                angle: 30,
                penumbra: 0.15
            })
            logger.log('direction:', light.direction.x, light.direction.y, light.direction.z)
            logger.log('angle:', light.angle)
            logger.log('penumbra:', light.penumbra)
        })

        action('No direction (point light)', () => {
            const light = new Light3D({x: 0, y: 5, z: 0})
            logger.log('direction:', light.direction)
        })

    })

})
