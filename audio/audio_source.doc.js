import {doc, section, text, code, container, logger} from '../doc/runtime.js'
import AudioSystem from './audio_system.js'


export default doc('AudioSource', {advanced: true}, () => {

    text(`
        Represents a single playing sound in the audio system.
        Created by [[AudioSystem]] when you call \`play()\`, \`playAt()\`, or \`playOscillator()\`.
        Supports volume, loop, playback rate, fade effects, and spatial positioning.
        Extends [[PerkyModule]].
    `)


    section('Properties', () => {

        text('Each AudioSource exposes its current playback state.')

        code('Playback state', () => {
            const source = audioSystem.play('click', {
                channel: 'sfx',
                loop: true,
                volume: 0.8
            })

            source.playing      // true while sound is active
            source.loop          // whether it loops
            source.volume        // 0 to 1
            source.playbackRate  // 0.1 to 10
            source.currentTime   // elapsed time in seconds
            source.channel       // the AudioChannel it belongs to
            source.spatial       // true for positional audio
        })

    })


    section('Volume and Playback Rate', () => {

        text('Adjust volume and speed of a playing sound.')

        container({title: 'Volume and rate control', height: 200}, async ctx => {
            const audio = new AudioSystem()
            audio.start()
            await audio.unlock()

            let source = null

            ctx.action('Play Oscillator', () => {
                if (source) {
                    source.stop()
                }
                source = audio.playOscillator({type: 'sine', frequency: 440, duration: null})
                logger.log('Playing sine wave')
            })

            ctx.slider('Volume', {min: 0, max: 1, default: 1, step: 0.1}, value => {
                if (source) {
                    source.setVolume(value)
                }
            })

            ctx.slider('Playback Rate', {min: 0.5, max: 2, default: 1, step: 0.1}, value => {
                if (source) {
                    source.setPlaybackRate(value)
                }
            })

            ctx.action('Stop', () => {
                if (source) {
                    source.stop()
                    source = null
                }
            })

            ctx.setApp(audio)
        })

    })


    section('Fading', () => {

        text('Smoothly fade volume in or out over a duration.')

        code('Fade examples', () => {
            const source = audioSystem.play('bgm', {channel: 'music', loop: true})

            // Fade in over 2 seconds
            source.fadeIn(2)

            // Fade out over 1 second, then stop
            source.fadeOut(1)

            // Fade out without stopping
            source.fadeOut(1, false)
        })

    })


    section('Spatial Audio', () => {

        text(`
            Spatial sources are created with \`playAt()\` and position sound in 2D space.
            Distance from the listener affects perceived volume.
        `)

        code('Spatial source', () => {
            const source = audioSystem.playAt('footstep', 5, 3, {
                refDistance: 1,
                maxDistance: 20,
                rolloffFactor: 1
            })

            source.x              // current x position
            source.y              // current y position
            source.spatial         // true
            source.refDistance     // distance at full volume
            source.maxDistance     // distance where sound is silent
            source.rolloffFactor  // how quickly volume drops

            // Update position
            source.setPosition(10, 5)
            source.getPosition()  // {x: 10, y: 5}
        })

    })


    section('Events', () => {

        text('AudioSource emits events during its lifecycle.')

        code('Event handling', () => {
            const source = audioSystem.play('click')

            source.on('play', () => {
                logger.log('Playback started')
            })

            source.on('stop', () => {
                logger.log('Manually stopped')
            })

            source.on('ended', () => {
                logger.log('Playback finished naturally')
            })
        })

    })

})
