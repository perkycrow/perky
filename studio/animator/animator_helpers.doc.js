import {doc, section, text, code} from '../../doc/runtime.js'
import {inferSpritesheetName, collectEventSuggestions, buildAnimationConfig} from './animator_helpers.js'


export default doc('Animator Helpers', {advanced: true}, () => {

    text(`
        Utility functions used by the [[AnimatorView@studio/animator]] to serialize animation
        data and extract metadata from animator configurations.
    `)


    section('inferSpritesheetName', () => {

        text(`
            Extracts the spritesheet name from an animator config by looking at the first
            animation's source field. Returns the part before the colon in source strings
            like \`"spritesheet:frame_0"\`.
        `)

        code('Usage', () => {
            const config = {
                animations: {
                    idle: {source: 'player:idle_0'}
                }
            }

            inferSpritesheetName(config) // 'player'
            inferSpritesheetName(null) // null
        })

    })


    section('buildAnimationConfig', () => {

        text(`
            Converts an animation object into a serializable config. Includes fps,
            loop, playback mode, motion settings, and frame data. Only includes
            optional fields when they differ from defaults.
        `)

        code('Usage', () => {
            const anim = {
                fps: 12,
                loop: true,
                playbackMode: 'forward',
                motion: {enabled: false},
                frames: [
                    {source: 'player:idle_0', duration: 1, events: []}
                ]
            }

            const config = buildAnimationConfig(anim, 'player')
            config.fps // 12
            config.frames.length // 1
        })

    })

})
