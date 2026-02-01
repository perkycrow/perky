import {doc, section, text, action, logger} from '../../doc/runtime.js'
import SplatterEffect from './splatter_effect.js'


export default doc('SplatterEffect', () => {

    text(`
        Applies a splatter dissolve effect to sprites using an atlas texture.
        Extends [[SpriteEffect@render]]. Used with [[SpriteEffectStack@render]].
    `)


    section('Creation', () => {

        text('Create with optional intensity, pattern, and atlas parameters.')

        action('Default splatter', () => {
            const splatter = new SplatterEffect()

            logger.log('type:', splatter.type)
            logger.log('intensity:', splatter.intensity)
            logger.log('pattern:', splatter.pattern)
            logger.log('atlas:', splatter.atlas)
        })

        action('Custom splatter', () => {
            const splatter = new SplatterEffect({
                intensity: 0.5,
                pattern: 2
            })

            logger.log('intensity:', splatter.intensity)
            logger.log('pattern:', splatter.pattern)
        })

    })


    section('Intensity', () => {

        text('Intensity is clamped between 0 and 1.')

        action('Clamped intensity', () => {
            const splatter = new SplatterEffect()

            splatter.intensity = 0.7
            logger.log('set 0.7:', splatter.intensity)

            splatter.intensity = 2.0
            logger.log('set 2.0 (clamped):', splatter.intensity)

            splatter.intensity = -1
            logger.log('set -1 (clamped):', splatter.intensity)
        })

    })


    section('Hints', () => {

        text('`getHints()` returns the current parameters for the shader pipeline.')

        action('getHints', () => {
            const splatter = new SplatterEffect({
                intensity: 0.3,
                pattern: 1
            })

            const hints = splatter.getHints()
            logger.log('hints.intensity:', hints.intensity)
            logger.log('hints.pattern:', hints.pattern)
            logger.log('hints.atlas:', hints.atlas)
        })

    })

})
