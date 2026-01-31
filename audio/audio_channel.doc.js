import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import AudioChannel from './audio_channel.js'


export default doc('AudioChannel', () => {

    text(`
        A named audio bus with its own gain node. Routes through the master gain
        of [[AudioSystem]]. Tracks active sources and provides volume and mute controls.
    `)


    section('Basic Usage', () => {

        text(`
            AudioChannels are typically created by [[AudioSystem]] (music, sfx, ambiance
            by default). Each channel has independent volume and mute state.
        `)

        code('Access via AudioSystem', () => {
            const channel = audioSystem.getChannel('music')
            channel.volume    // current volume (0–1)
            channel.muted     // boolean
            channel.sources   // active AudioSource instances
        })

    })


    section('Volume Control', () => {

        text('Set volume as a value between 0 and 1. Values are clamped automatically.')

        action('Volume methods', () => {
            const channel = new AudioChannel({$id: 'sfx'})

            channel.setVolume(0.5)
            logger.log('Volume:', channel.getVolume())

            channel.setVolume(1)
            logger.log('Volume:', channel.getVolume())

            channel.volume = 0.8
            logger.log('Volume:', channel.volume)
        })

    })


    section('Mute', () => {

        text('Mute and unmute without losing the volume setting.')

        action('Mute toggle', () => {
            const channel = new AudioChannel({$id: 'music'})
            channel.setVolume(0.7)

            channel.mute()
            logger.log('Muted:', channel.muted)

            channel.unmute()
            logger.log('Muted:', channel.muted)

            channel.toggleMute()
            logger.log('Muted:', channel.muted)
        })

    })


    section('Source Management', () => {

        text(`
            Channels track their active sources. Sources are registered when they
            start playing and unregistered when they stop.
        `)

        action('Register and query sources', () => {
            const channel = new AudioChannel({$id: 'sfx'})

            const fakeSource = {$id: 'explosion_1', stop () {}}
            channel.registerSource(fakeSource)
            logger.log('Source count:', channel.sourceCount)
            logger.log('Has source:', channel.hasSource('explosion_1'))

            channel.unregisterSource(fakeSource)
            logger.log('Source count:', channel.sourceCount)
        })

        code('Stop all sources', () => {
            channel.stopAll()
            channel.sourceCount // 0
        })

    })


    section('Events', () => {

        text('Channels emit events for volume changes, mute state, and source lifecycle.')

        code('Event list', () => {
            channel.on('volume:changed', (volume) => {})
            channel.on('muted', () => {})
            channel.on('unmuted', () => {})
            channel.on('source:added', (source) => {})
            channel.on('source:removed', (source) => {})
        })

    })

})
