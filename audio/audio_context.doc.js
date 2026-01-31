import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import AudioContext from './audio_context.js'


export default doc('AudioContext', () => {

    text(`
        Thin wrapper around the Web Audio API's \`AudioContext\`. Lazy-initializes on first use.
        Handles the master gain node, audio node creation, data decoding, and listener
        positioning for spatial audio.
    `)


    section('Initialization', () => {

        text(`
            The context is created lazily. Call \`init()\` explicitly or let it happen
            on first node creation. Repeated calls are safe — it returns the existing context.
        `)

        action('Init and inspect', () => {
            const ctx = new AudioContext()
            ctx.init()

            logger.log('Sample rate:', ctx.sampleRate)
            logger.log('Current time:', ctx.currentTime)
            logger.log('Suspended:', ctx.suspended)

            ctx.dispose()
        })

    })


    section('Master Volume', () => {

        text('Controls the gain on the master output node. Values are clamped between 0 and 1.')

        action('Volume control', () => {
            const ctx = new AudioContext()
            ctx.init()

            ctx.setMasterVolume(0.5)
            logger.log('Master volume:', ctx.getMasterVolume())

            ctx.setMasterVolume(1)
            logger.log('Master volume:', ctx.getMasterVolume())

            ctx.dispose()
        })

    })


    section('Suspend and Resume', () => {

        text(`
            Suspend pauses audio processing to save resources. Resume restarts it
            and processes any queued \`decodeAudioData\` calls.
        `)

        code('Suspend and resume', async () => {
            const ctx = new AudioContext()
            ctx.init()

            ctx.suspend()
            ctx.suspended // true

            await ctx.resume()
            ctx.suspended // false

            ctx.dispose()
        })

    })


    section('Node Creation', () => {

        text('Convenience methods to create Web Audio nodes. Each calls `init()` if needed.')

        code('Available factories', () => {
            const ctx = new AudioContext()

            ctx.createGain()           // GainNode
            ctx.createOscillator()     // OscillatorNode
            ctx.createBufferSource()   // AudioBufferSourceNode
            ctx.createPanner()         // PannerNode
            ctx.createStereoPanner()   // StereoPannerNode

            ctx.dispose()
        })

    })


    section('Listener Position', () => {

        text('Set and get the listener position for spatial audio.')

        action('Listener position', () => {
            const ctx = new AudioContext()
            ctx.init()

            ctx.setListenerPosition(5, 3, 0)
            const pos = ctx.getListenerPosition()
            logger.log('Listener:', pos.x, pos.y, pos.z)

            ctx.dispose()
        })

    })

})
