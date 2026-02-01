import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import SpriteAnimator from './sprite_animator.js'


export default doc('SpriteAnimator', () => {

    text(`
        Container for sprite animations. Extends [[PerkyModule@core]] and manages
        multiple [[SpriteAnimation@render]] children. Resolves animation frames from
        spritesheets or direct texture regions through [[TextureSystem@render/textures]].
    `)


    section('Configuration', () => {

        text(`
            Animations are defined in a config object where each key is an animation name.
            Frames can come from a spritesheet source or be listed individually.
        `)

        code('Source-based config', () => {
            const animator = new SpriteAnimator({
                config: {
                    animations: {
                        idle: {
                            source: 'character:idle',
                            fps: 8,
                            loop: true
                        },
                        run: {
                            source: 'character:run',
                            fps: 12,
                            playbackMode: 'forward'
                        }
                    }
                }
            })
        })

        code('Frame-based config', () => {
            const animator = new SpriteAnimator({
                config: {
                    animations: {
                        attack: {
                            frames: [
                                {source: 'character:attack_01', duration: 100},
                                {source: 'character:attack_02', duration: 80},
                                {source: 'character:attack_03', events: ['hit']}
                            ],
                            fps: 10,
                            loop: false
                        }
                    }
                }
            })
        })

    })


    section('Playback', () => {

        text(`
            Use \`play(name)\` to switch animations. The previous animation is stopped
            and the new one starts from the beginning. Call \`update(deltaTime)\` each
            frame to advance the current animation.
        `)

        code('Playing animations', () => {
            const animator = new SpriteAnimator()

            animator.play('idle')
            animator.play('run')  // stops idle, starts run

            // In your game loop
            // animator.update(deltaTime)
        })

    })


    section('Retrieving Animations', () => {

        text('Use `get(name)` to access a specific animation child.')

        code('Getting an animation', () => {
            const animator = new SpriteAnimator()

            const idle = animator.get('idle')

            // Returns the SpriteAnimation instance or undefined
        })

    })


    section('Frame Events', () => {

        text(`
            Frames can trigger named events when reached during playback.
            Define events in the frame config and listen on the [[SpriteAnimation@render]] instance.
        `)

        code('Frame events config', () => {
            const animator = new SpriteAnimator({
                config: {
                    animations: {
                        attack: {
                            frames: [
                                {source: 'hero:swing_01'},
                                {source: 'hero:swing_02', events: ['hit']},
                                {source: 'hero:swing_03'}
                            ]
                        }
                    }
                }
            })

            const attack = animator.get('attack')

            // attack.on('hit', () => { ... })
        })

    })

})
