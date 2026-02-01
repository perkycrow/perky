import {doc, section, text, action, logger} from '../../doc/runtime.js'
import OutlineEffect from './outline_effect.js'


export default doc('OutlineEffect', () => {

    text(`
        Draws an outline around sprite edges by detecting alpha boundaries in the texture.
        Extends [[SpriteEffect@render]]. Used with [[SpriteEffectStack@render]].
    `)


    section('Creation', () => {

        text('Create with optional width and color parameters.')

        action('Default outline', () => {
            const outline = new OutlineEffect()

            logger.log('type:', outline.type)
            logger.log('width:', outline.width)
            logger.log('color:', outline.color)
        })

        action('Custom width and color', () => {
            const outline = new OutlineEffect({
                width: 0.05,
                color: [1, 0, 0, 1]
            })

            logger.log('width:', outline.width)
            logger.log('color:', outline.color)
        })

    })


    section('Properties', () => {

        text('Width and color can be changed at runtime.')

        action('Modify properties', () => {
            const outline = new OutlineEffect({width: 0.02})

            logger.log('initial width:', outline.width)

            outline.width = 0.08
            logger.log('new width:', outline.width)

            outline.color = [0, 1, 0, 1]
            logger.log('new color:', outline.color)
        })

    })


    section('Hints', () => {

        text('`getHints()` returns the current parameters for the shader pipeline.')

        action('getHints', () => {
            const outline = new OutlineEffect({
                width: 0.03,
                color: [1, 1, 0, 1]
            })

            const hints = outline.getHints()
            logger.log('hints.width:', hints.width)
            logger.log('hints.color:', hints.color)
        })

    })

})
