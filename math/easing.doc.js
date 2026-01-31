import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Easing from './easing.js'


export default doc('Easing', () => {

    text(`
        Standard easing functions for animations and transitions.
        Each function takes a value \`t\` in \`[0, 1]\` and returns the eased value.
    `)


    section('Using Easings', () => {

        text('Access easing functions by name from the Easing object.')

        action('Direct call', () => {
            logger.log('linear(0.5):', Easing.linear(0.5))
            logger.log('easeInQuad(0.5):', Easing.easeInQuad(0.5))
            logger.log('easeOutCubic(0.5):', Easing.easeOutCubic(0.5))
            logger.log('easeInOutSine(0.5):', Easing.easeInOutSine(0.5))
        })

    })


    section('resolve', () => {

        text(`
            Resolves an easing by name or returns the function directly.
            Falls back to \`linear\` for unknown names.
        `)

        action('By name', () => {
            const ease = Easing.resolve('easeOutQuad')
            logger.log('easeOutQuad(0.5):', ease(0.5))
        })

        action('Custom function', () => {
            const custom = t => t * t * t
            const ease = Easing.resolve(custom)
            logger.log('custom(0.5):', ease(0.5))
        })

        action('Unknown fallback', () => {
            const ease = Easing.resolve('nonexistent')
            logger.log('fallback(0.5):', ease(0.5))
        })

    })


    section('lerp', () => {

        text('Linearly interpolates between two values with an optional easing.')

        action('Linear interpolation', () => {
            logger.log('0%:', Easing.lerp(0, 100, 0))
            logger.log('50%:', Easing.lerp(0, 100, 0.5))
            logger.log('100%:', Easing.lerp(0, 100, 1))
        })

        action('With easing', () => {
            logger.log('linear 50%:', Easing.lerp(0, 100, 0.5, 'linear'))
            logger.log('easeInQuad 50%:', Easing.lerp(0, 100, 0.5, 'easeInQuad'))
            logger.log('easeOutCubic 50%:', Easing.lerp(0, 100, 0.5, 'easeOutCubic'))
        })

    })


    section('Available Easings', () => {

        text(`
            Quad, Cubic, Quart, Quint, Sine, Expo, Circ, Back, Elastic, and Bounce.
            Each has three variants: \`easeIn\`, \`easeOut\`, and \`easeInOut\`.
        `)

        action('Compare variants', () => {
            const t = 0.25
            logger.log('easeInQuad:', Easing.easeInQuad(t).toFixed(4))
            logger.log('easeOutQuad:', Easing.easeOutQuad(t).toFixed(4))
            logger.log('easeInOutQuad:', Easing.easeInOutQuad(t).toFixed(4))
        })

        action('Bouncy easings', () => {
            logger.log('easeOutBounce(0.5):', Easing.easeOutBounce(0.5).toFixed(4))
            logger.log('easeOutElastic(0.5):', Easing.easeOutElastic(0.5).toFixed(4))
            logger.log('easeOutBack(0.5):', Easing.easeOutBack(0.5).toFixed(4))
        })

    })

})
