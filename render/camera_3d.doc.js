import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Camera3D from './camera_3d.js'
import Vec3 from '../math/vec3.js'


export default doc('Camera3D', () => {

    text(`
        A perspective camera for 3D rendering. Manages view and projection matrices
        with lazy recalculation when parameters change.
    `)


    section('Creation', () => {

        text('Create a camera with position and projection parameters.')

        action('Default values', () => {
            const cam = new Camera3D()
            logger.log('position:', cam.position.x, cam.position.y, cam.position.z)
            logger.log('fov:', (cam.fov * 180 / Math.PI).toFixed(0) + '°')
            logger.log('aspect:', cam.aspect)
            logger.log('near:', cam.near)
            logger.log('far:', cam.far)
        })

        action('With options', () => {
            const cam = new Camera3D({
                x: 0,
                y: 5,
                z: 10,
                fov: Math.PI / 3,
                aspect: 16 / 9,
                near: 0.5,
                far: 500
            })
            logger.log('position:', cam.position.x, cam.position.y, cam.position.z)
            logger.log('fov:', (cam.fov * 180 / Math.PI).toFixed(0) + '°')
            logger.log('aspect:', cam.aspect.toFixed(2))
        })

    })


    section('Position', () => {

        text('Move the camera in 3D space.')

        action('setPosition', () => {
            const cam = new Camera3D()
            cam.setPosition(5, 10, 15)
            logger.log('position:', cam.position.x, cam.position.y, cam.position.z)
        })

        code('Direct position access', () => {
            const cam = new Camera3D()
            cam.position.set(1, 2, 3)
            cam.markDirty()
        })

    })


    section('Projection Parameters', () => {

        text('Adjust field of view, aspect ratio, and clipping planes.')

        action('setFov', () => {
            const cam = new Camera3D()
            cam.setFov(Math.PI / 3)
            logger.log('fov:', (cam.fov * 180 / Math.PI).toFixed(0) + '°')
        })

        action('setAspect', () => {
            const cam = new Camera3D()
            cam.setAspect(16 / 9)
            logger.log('aspect:', cam.aspect.toFixed(2))
        })

        action('setNearFar', () => {
            const cam = new Camera3D()
            cam.setNearFar(1, 1000)
            logger.log('near:', cam.near)
            logger.log('far:', cam.far)
        })

    })


    section('View and Projection Matrices', () => {

        text(`
            Access the view and projection matrices. They are lazily computed
            and cached until parameters change.
        `)

        action('viewMatrix', () => {
            const cam = new Camera3D({z: 5})
            const view = cam.viewMatrix
            logger.log('view matrix z translation:', view.elements[14])
        })

        action('projectionMatrix', () => {
            const cam = new Camera3D({fov: Math.PI / 4, aspect: 16 / 9})
            const proj = cam.projectionMatrix
            logger.log('projection[0] (x scale):', proj.elements[0].toFixed(3))
            logger.log('projection[5] (y scale):', proj.elements[5].toFixed(3))
        })

    })


    section('Look At', () => {

        text('Orient the camera to look at a specific point in 3D space.')

        action('lookAt', () => {
            const cam = new Camera3D({x: 5, y: 5, z: 5})
            cam.lookAt(new Vec3(0, 0, 0))
            logger.log('Camera looking at origin')
            logger.log('rotation:', cam.rotation.x.toFixed(2), cam.rotation.y.toFixed(2), cam.rotation.z.toFixed(2))
        })

        code('Common setup', () => {
            const cam = new Camera3D({x: 0, y: 2, z: 5})
            cam.lookAt(new Vec3(0, 0, 0))
        })

    })


    section('Method Chaining', () => {

        text('Setter methods return `this` for chaining.')

        action('Chained calls', () => {
            const cam = new Camera3D()
                .setPosition(0, 5, 10)
                .setFov(Math.PI / 3)
                .setAspect(16 / 9)
                .setNearFar(0.1, 1000)
                .lookAt(new Vec3(0, 0, 0))

            logger.log('position:', cam.position.x, cam.position.y, cam.position.z)
            logger.log('fov:', (cam.fov * 180 / Math.PI).toFixed(0) + '°')
        })

    })

})
