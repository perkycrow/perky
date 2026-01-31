import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Noise from './noise.js'


export default doc('Noise', () => {

    text(`
        Seedable Perlin noise generator.
        Supports 2D/3D noise and fractional Brownian motion (fbm).
    `)


    code('Creation', () => {
        const noise = new Noise(42)
        const defaultNoise = new Noise()
    })


    section('perlin', () => {

        text('Generates 3D Perlin noise. The y and z parameters default to 0.')

        action('2D noise', () => {
            const noise = new Noise(42)
            logger.log('perlin(1.5, 2.3):', noise.perlin(1.5, 2.3))
            logger.log('perlin(0.5, 0.5):', noise.perlin(0.5, 0.5))
            logger.log('perlin(3.0, 1.0):', noise.perlin(3.0, 1.0))
        })

        action('3D noise', () => {
            const noise = new Noise(42)
            logger.log('perlin(1.5, 2.3, 0.7):', noise.perlin(1.5, 2.3, 0.7))
            logger.log('perlin(0.5, 0.5, 0.5):', noise.perlin(0.5, 0.5, 0.5))
        })

    })


    section('perlin2d', () => {

        text('Shorthand for `perlin(x, y, 0)`.')

        action('Example', () => {
            const noise = new Noise(42)
            logger.log('perlin2d(1.5, 2.3):', noise.perlin2d(1.5, 2.3))
            logger.log('perlin(1.5, 2.3, 0):', noise.perlin(1.5, 2.3, 0))
            logger.log('Same result')
        })

    })


    section('fbm', () => {

        text(`
            Fractional Brownian motion. Layers multiple octaves of Perlin noise
            for more natural-looking results.
        `)

        action('Default parameters', () => {
            const noise = new Noise(42)
            logger.log('fbm(1.5, 2.3):', noise.fbm(1.5, 2.3))
        })

        action('Custom parameters', () => {
            const noise = new Noise(42)
            logger.log('1 octave:', noise.fbm(1.5, 2.3, {octaves: 1}))
            logger.log('4 octaves:', noise.fbm(1.5, 2.3, {octaves: 4}))
            logger.log('8 octaves:', noise.fbm(1.5, 2.3, {octaves: 8}))
        })

    })


    section('seed', () => {

        text('Reseeds the generator. Same seed produces the same noise values.')

        action('Reproducibility', () => {
            const noise = new Noise(42)
            logger.log('seed 42:', noise.perlin2d(1.0, 1.0))

            noise.seed(99)
            logger.log('seed 99:', noise.perlin2d(1.0, 1.0))

            noise.seed(42)
            logger.log('seed 42 again:', noise.perlin2d(1.0, 1.0))
        })

    })

})
