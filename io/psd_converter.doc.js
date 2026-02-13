import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import PsdConverter from './psd_converter.js'


export default doc('PsdConverter', {advanced: true}, () => {

    text(`
        Orchestrates the full PSD-to-spritesheet pipeline. Parses a PSD file,
        extracts animation frames, resizes them, packs into atlases, and builds
        JSON metadata. Extends [[Notifier@core]] and emits progress events
        throughout the conversion.
    `)


    section('Parsing', () => {

        text('Parses a raw ArrayBuffer into a PSD structure using the parser from `psd.js`.')

        code('Parse a PSD file', () => {
            const converter = new PsdConverter()
            const psd = converter.parse(buffer)

            psd.width   // 512
            psd.height  // 512
            psd.tree    // layer tree
        })

    })


    section('Animation Info', () => {

        text('Inspects the PSD tree to find animation groups and frame counts before running the full conversion.')

        action('getAnimationGroups', () => {
            const converter = new PsdConverter()

            logger.log('getAnimationGroups returns PSD groups named "anim - ..."')
            logger.log('getAnimationInfo returns [{name, frameCount}, ...]')
        })

        code('Inspect animations', () => {
            const converter = new PsdConverter()
            const groups = converter.getAnimationGroups(psd)
            const info = converter.getAnimationInfo(psd)

            // info: [{name: 'idle', frameCount: 4}, {name: 'run', frameCount: 6}]
        })

    })


    section('Conversion', () => {

        text(`
            The \`convert\` method runs the full pipeline: extract frames, resize,
            pack into atlases, composite, and build JSON. Emits progress events
            at each stage: extracting, resizing, packing, compositing, finalizing, complete.
        `)

        code('Full conversion', async () => {
            const converter = new PsdConverter()

            converter.on('progress', ({stage, percent}) => {
                // 'extracting' -> 'resizing' -> 'packing' -> 'compositing' -> 'finalizing' -> 'complete'
            })

            const result = await converter.convert(psd, {
                targetWidth: 256,
                name: 'hero'
            })

            result.atlases          // [{canvas, frames, finalHeight}]
            result.spritesheetJson  // atlas JSON data
            result.animatorConfig   // animation config for the game
            result.name             // 'hero'
            result.spritesheetName  // 'heroSpritesheet'
        })

    })


    section('Animator Config', () => {

        text(`
            Builds an animator configuration object from the conversion result.
            Each animation defaults to 10 fps with looping enabled.
        `)

        code('Config structure', () => {
            const config = converter.buildAnimatorConfig('heroSpritesheet', {
                idle: ['idle_1', 'idle_2'],
                run: ['run_1', 'run_2', 'run_3']
            })

            // config.spritesheet: 'heroSpritesheet'
            // config.anchor: {x: 0.5, y: 0.5}
            // config.animations.idle.fps: 10
            // config.animations.idle.loop: true
        })

    })

})
