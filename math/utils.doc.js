import {doc, text, action, logger} from '../doc/runtime.js'
import {clamp, snap} from './utils.js'


export default doc('Math Utils', () => {

    text(`
        Simple math utilities for common operations.
    `)


    action('clamp', () => {
        logger.log('clamp(5, 0, 10):', clamp(5, 0, 10))
        logger.log('clamp(-5, 0, 10):', clamp(-5, 0, 10))
        logger.log('clamp(15, 0, 10):', clamp(15, 0, 10))
    })


    action('snap', () => {
        logger.log('snap(7, 5):', snap(7, 5))
        logger.log('snap(12, 5):', snap(12, 5))
        logger.log('snap(0.35, 0.25):', snap(0.35, 0.25))
    })

})
