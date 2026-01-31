import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import Color from './color.js'


export default doc('Color', () => {

    text(`
        Mutable color with multiple input formats and method chaining.
        Stores channels as floats in \`[0, 1]\`.
    `)


    section('Creation', () => {

        text('Colors can be created from hex strings, CSS names, rgb/hsl strings, numbers, arrays, or objects.')

        code('Input formats', () => {
            const a = new Color('#ff6600')
            const b = new Color('orange')
            const c = new Color('rgb(255, 102, 0)')
            const d = new Color('hsl(24, 100, 50)')
            const e = new Color(0xff6600)
            const f = new Color([1, 0.4, 0])
            const g = new Color({r: 1, g: 0.4, b: 0})
            const h = new Color({h: 24, s: 100, l: 50})
        })

    })


    section('Output Formats', () => {

        setup(ctx => {
            ctx.color = new Color('#4a9eff')
        })

        action('toHex', ctx => {
            logger.log('hex:', ctx.color.toHex())
            logger.log('with alpha:', ctx.color.toHex(true))
        })

        action('toRgb / toRgbString', ctx => {
            logger.log('rgb object:', ctx.color.toRgb())
            logger.log('rgb string:', ctx.color.toRgbString())
        })

        action('toHsl / toHslString', ctx => {
            logger.log('hsl object:', ctx.color.toHsl())
            logger.log('hsl string:', ctx.color.toHslString())
        })

    })


    section('Manipulation', () => {

        text('Methods return `this` for chaining. They mutate the color in place.')

        action('lighten / darken', () => {
            const color = new Color('#4a9eff')
            logger.log('original:', color.toHex())
            logger.log('lighten 20:', color.clone().lighten(20).toHex())
            logger.log('darken 20:', color.clone().darken(20).toHex())
        })

        action('saturate / desaturate', () => {
            const color = new Color('#4a9eff')
            logger.log('original:', color.toHex())
            logger.log('saturate 30:', color.clone().saturate(30).toHex())
            logger.log('desaturate 30:', color.clone().desaturate(30).toHex())
        })

        action('rotate', () => {
            const color = new Color('#ff0000')
            logger.log('red:', color.toHex())
            logger.log('+120°:', color.clone().rotate(120).toHex())
            logger.log('+240°:', color.clone().rotate(240).toHex())
        })

        action('mix', () => {
            const red = new Color('#ff0000')
            const blue = new Color('#0000ff')
            logger.log('red:', red.toHex())
            logger.log('blue:', blue.toHex())
            logger.log('50% mix:', red.clone().mix(blue, 0.5).toHex())
        })

        action('invert / grayscale', () => {
            const color = new Color('#4a9eff')
            logger.log('original:', color.toHex())
            logger.log('inverted:', color.clone().invert().toHex())
            logger.log('grayscale:', color.clone().grayscale().toHex())
        })

    })


    section('Properties', () => {

        action('luminance / isDark / isLight', () => {
            const dark = new Color('#1a1a2e')
            const light = new Color('#f0f0f0')
            logger.log('dark luminance:', dark.luminance.toFixed(4))
            logger.log('dark.isDark:', dark.isDark)
            logger.log('light luminance:', light.luminance.toFixed(4))
            logger.log('light.isLight:', light.isLight)
        })

    })

})
