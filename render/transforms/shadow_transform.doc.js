import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import ShadowTransform from './shadow_transform.js'


export default doc('ShadowTransform', () => {

    text(`
        Projects a skewed shadow beneath sprites in a [[RenderGroup@render]].
        Extends [[RenderTransform@render]] and uses a dedicated shadow shader.
    `)


    section('Creation', () => {

        text('Create with optional skew, scale, offset, and color parameters.')

        action('Default shadow', () => {
            const shadow = new ShadowTransform()

            logger.log('skewX:', shadow.skewX)
            logger.log('scaleY:', shadow.scaleY)
            logger.log('offsetY:', shadow.offsetY)
            logger.log('color:', shadow.color)
        })

        action('Custom shadow', () => {
            const shadow = new ShadowTransform({
                skewX: 0.8,
                scaleY: -0.5,
                offsetY: 0.1,
                color: [0.1, 0, 0.2, 0.6]
            })

            logger.log('skewX:', shadow.skewX)
            logger.log('scaleY:', shadow.scaleY)
            logger.log('offsetY:', shadow.offsetY)
            logger.log('color:', shadow.color)
        })

    })


    section('Properties', () => {

        text('All shadow parameters can be tweaked at runtime.')

        action('Modify properties', () => {
            const shadow = new ShadowTransform()

            shadow.skewX = 1.0
            shadow.scaleY = -0.4
            shadow.offsetY = 0.05
            shadow.color = [0, 0, 0, 0.8]

            logger.log('skewX:', shadow.skewX)
            logger.log('scaleY:', shadow.scaleY)
            logger.log('offsetY:', shadow.offsetY)
            logger.log('color:', shadow.color)
        })

    })


    section('Property Config', () => {

        text('`getPropertyConfig()` returns slider ranges for inspector UIs.')

        action('getPropertyConfig', () => {
            const shadow = new ShadowTransform()
            const config = shadow.getPropertyConfig()

            logger.log('skewX range:', config.skewX.min, 'to', config.skewX.max)
            logger.log('scaleY range:', config.scaleY.min, 'to', config.scaleY.max)
            logger.log('color type:', config.color.type)
        })

    })

})
