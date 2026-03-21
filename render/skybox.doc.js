import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Skybox from './skybox.js'


export default doc('Skybox', () => {

    text(`
        Background environment for 3D scenes. Supports either a cubemap texture
        or a procedural gradient with sky, horizon, and ground colors.
    `)


    section('Creation', () => {

        text('Create a skybox with default gradient colors or a cubemap.')

        code('Default gradient', () => {
            const skybox = new Skybox()
        })

        code('Custom gradient colors', () => {
            const skybox = new Skybox({
                skyColor: [0.1, 0.2, 0.5],
                horizonColor: [0.8, 0.7, 0.6],
                groundColor: [0.2, 0.2, 0.15]
            })
        })

        code('With cubemap', () => {
            const skybox = new Skybox({
                cubemap: cubemapTexture
            })
        })

    })


    section('Gradient Colors', () => {

        text('The procedural skybox uses three colors for sky, horizon, and ground.')

        action('Color access', () => {
            const skybox = new Skybox()

            logger.log('skyColor:', skybox.skyColor)
            logger.log('horizonColor:', skybox.horizonColor)
            logger.log('groundColor:', skybox.groundColor)
        })

        action('Custom colors', () => {
            const skybox = new Skybox({
                skyColor: [0.0, 0.1, 0.3],
                horizonColor: [1.0, 0.5, 0.2],
                groundColor: [0.1, 0.1, 0.05]
            })

            logger.log('sunset skyColor:', skybox.skyColor)
            logger.log('sunset horizonColor:', skybox.horizonColor)
        })

    })


    section('Cubemap', () => {

        text('Set a cubemap texture for environment mapping.')

        action('Cubemap check', () => {
            const gradient = new Skybox()
            logger.log('gradient cubemap:', gradient.cubemap)

            const mapped = new Skybox({cubemap: 'texture-reference'})
            logger.log('mapped cubemap:', mapped.cubemap)
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const skybox = new Skybox({
                cubemap: null,
                skyColor: [0.2, 0.4, 0.8],
                horizonColor: [0.7, 0.8, 0.9],
                groundColor: [0.3, 0.3, 0.25]
            })
        })

        code('Properties', () => {
            skybox.cubemap
            skybox.skyColor
            skybox.horizonColor
            skybox.groundColor
        })

    })

})
