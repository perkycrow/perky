import {doc, section, text, code} from '../../doc/runtime.js'
import {inferSpritesheetName, buildAnimationConfig, collectEventSuggestions, buildFramePreview, buildAnimatorFiles} from './animator_helpers.js'


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
                motion: {enabled: true, mode: 'walk', direction: 'e'},
                frames: [
                    {source: 'player:idle_0', duration: 1, events: ['footstep']}
                ]
            }

            const config = buildAnimationConfig(anim, 'player')
            config.fps // 12
            config.motion // {mode: 'walk', direction: 'e'}
            config.frames.length // 1
        })

    })


    section('collectEventSuggestions', () => {

        text(`
            Collects unique event names from all frames across all animations in
            the animator. Returns up to 6 suggestions, excluding any events
            already present in the exclude list.
        `)

        code('Usage', () => {
            const suggestions = collectEventSuggestions(animator, ['footstep'])

            // ['attack', 'jump', ...]
        })

    })


    section('buildFramePreview', () => {

        text(`
            Creates a DOM element displaying a frame thumbnail and name. Draws
            the frame's region onto a 120x120 canvas, centered and scaled to fit.
        `)

        code('Usage', () => {
            const previewEl = buildFramePreview(frame)
            container.appendChild(previewEl)
        })

    })


    section('buildAnimatorFiles', () => {

        text(`
            Builds an array of file objects for saving an animator to IndexedDB.
            Creates the animator JSON config, spritesheet JSON data, and PNG
            atlas images with appropriate filenames.
        `)

        code('Usage', () => {
            const files = buildAnimatorFiles({
                name: 'player',
                spritesheetName: 'playerSpritesheet',
                animatorConfig: {anchor: {x: 0.5, y: 0}, animations: {}},
                spritesheetData: {frames: []},
                atlasBlobs: [blob0, blob1]
            })

            // [{name: 'playerAnimator.json', blob}, {name: 'playerSpritesheet.json', blob}, ...]
        })

    })

})
