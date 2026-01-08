import {doc, section, text, code, container, logger} from '../doc/runtime.js'
import AudioSystem from './audio_system.js'


export default doc('AudioSystem', () => {

    text(`
        Manages audio playback with support for multiple channels, spatial audio,
        and dynamic sound effects. Uses the Web Audio API for high-quality audio rendering.
    `)


    section('Basic Setup', () => {

        text(`
            Create an audio system with default channels (music, sfx, ambiance).
            Audio must be unlocked by user interaction before playing.
        `)

        container({title: 'Simple sound playback', height: 200}, ctx => {
            const audioSystem = new AudioSystem()
            audioSystem.start()

            let ready = false

            ctx.action('Play Click', async () => {
                if (!ready) {
                    await audioSystem.unlock()
                    await audioSystem.loadBuffer('click', './assets/audio/click.ogg')
                    ready = true
                }
                audioSystem.play('click')
                logger.log('Playing click sound')
            })

            ctx.setApp(audioSystem)
        })

    })


    section('Channels', () => {

        text(`
            Audio channels allow you to group sounds and control their volume independently.
            Default channels are: music, sfx, and ambiance.
        `)

        container({height: 200}, async ctx => {
            const audio = new AudioSystem()
            audio.start()
            await audio.unlock()
            await Promise.all([
                audio.loadBuffer('click', './assets/audio/click.ogg'),
                audio.loadBuffer('pick', './assets/audio/pick.mp3'),
                audio.loadBuffer('tac', './assets/audio/tac.mp3')
            ])

            ctx.action('Play on SFX', () => audio.play('click', {channel: 'sfx'}))
            ctx.action('Play on Music', () => audio.play('pick', {channel: 'music', loop: true}))
            ctx.action('Stop All', () => audio.stopAll())

            ctx.setApp(audio)
        })

    })


    section('Master Volume', () => {

        text('Control the overall volume of all audio channels.')

        container({title: 'Master volume control', height: 200}, ctx => {
            const audioSystem = new AudioSystem()
            audioSystem.start()

            let ready = false

            ctx.action('Play Looped', async () => {
                if (!ready) {
                    await audioSystem.unlock()
                    await audioSystem.loadBuffer('tac', './assets/audio/tac.mp3')
                    ready = true
                }
                audioSystem.play('tac', {loop: true})
                logger.log('Playing looped sound')
            })

            ctx.slider('Master Volume', {min: 0, max: 1, default: 1, step: 0.1}, value => {
                audioSystem.setVolume(value)
            })

            ctx.action('Stop', () => {
                audioSystem.stopAll()
            })

            ctx.setApp(audioSystem)
        })

    })


    section('Playback Options', () => {

        text('Control loop, volume, and playback rate for individual sounds.')

        container({title: 'Sound properties', height: 250}, ctx => {
            const audioSystem = new AudioSystem()
            audioSystem.start()

            let ready = false
            let currentSource = null

            const ensureReady = async () => {
                if (!ready) {
                    await audioSystem.unlock()
                    await audioSystem.loadBuffer('click', './assets/audio/click.ogg')
                    ready = true
                }
            }

            ctx.action('Play Normal', async () => {
                await ensureReady()
                audioSystem.stopAll()
                currentSource = audioSystem.play('click')
                logger.log('Playing at normal speed')
            })

            ctx.action('Play Looped', async () => {
                await ensureReady()
                audioSystem.stopAll()
                currentSource = audioSystem.play('click', {loop: true})
                logger.log('Playing looped')
            })

            ctx.slider('Playback Rate', {min: 0.5, max: 2, default: 1, step: 0.1}, value => {
                if (currentSource) {
                    currentSource.setPlaybackRate(value)
                }
            })

            ctx.slider('Volume', {min: 0, max: 1, default: 1, step: 0.1}, value => {
                if (currentSource) {
                    currentSource.setVolume(value)
                }
            })

            ctx.action('Stop', () => {
                audioSystem.stopAll()
                currentSource = null
            })

            ctx.setApp(audioSystem)
        })

    })


    section('Spatial Audio', () => {

        text('Position sounds in 2D space with distance attenuation.')

        container({title: '3D sound positioning', height: 250}, ctx => {
            const audioSystem = new AudioSystem()
            audioSystem.start()

            let ready = false
            let spatialSource = null

            ctx.action('Play Spatial Sound', async () => {
                if (!ready) {
                    await audioSystem.unlock()
                    await audioSystem.loadBuffer('pick', './assets/audio/pick.mp3')
                    ready = true
                }
                audioSystem.stopAll()
                spatialSource = audioSystem.playAt('pick', 5, 0, {
                    loop: true,
                    refDistance: 1,
                    maxDistance: 10
                })
                logger.log('Playing spatial sound at (5, 0)')
            })

            ctx.slider('Sound X Position', {min: -10, max: 10, default: 5}, value => {
                if (spatialSource) {
                    spatialSource.setPosition(value, spatialSource.y)
                }
            })

            ctx.slider('Sound Y Position', {min: -10, max: 10, default: 0}, value => {
                if (spatialSource) {
                    spatialSource.setPosition(spatialSource.x, value)
                }
            })

            ctx.slider('Listener X', {min: -10, max: 10, default: 0}, value => {
                audioSystem.setListenerPosition(value, 0)
            })

            ctx.action('Stop', () => {
                audioSystem.stopAll()
                spatialSource = null
            })

            ctx.setApp(audioSystem)
        })

    })


    section('Oscillators', () => {

        text('Generate synthesized tones for sound effects.')

        container({height: 200}, async ctx => {
            const audio = new AudioSystem()
            audio.start()
            await audio.unlock()

            ctx.action('Sine (440 Hz)', () => {
                audio.playOscillator({type: 'sine', frequency: 440, duration: 0.5})
            })

            ctx.action('Square (220 Hz)', () => {
                audio.playOscillator({type: 'square', frequency: 220, duration: 0.5})
            })

            ctx.action('Sawtooth (330 Hz)', () => {
                audio.playOscillator({type: 'sawtooth', frequency: 330, duration: 0.5})
            })

            ctx.action('Triangle (550 Hz)', () => {
                audio.playOscillator({type: 'triangle', frequency: 550, duration: 0.5})
            })

            ctx.setApp(audio)
        })

    })


    section('Code Examples', () => {

        text('Common patterns for using the audio system.')

        code('Basic setup and playback', async () => {
            const audioSystem = new AudioSystem()
            audioSystem.start()

            // Load audio files
            await audioSystem.loadBuffer('jump', './sounds/jump.mp3')
            await audioSystem.loadBuffer('music', './sounds/bg-music.ogg')

            // Unlock on user interaction
            await audioSystem.unlock()

            // Play sounds
            audioSystem.play('jump', {channel: 'sfx'})
            audioSystem.play('music', {channel: 'music', loop: true})
        })

        code('Channel management', () => {
            // Create custom channel
            audioSystem.createChannel('voice', {volume: 0.8})

            // Control channels
            audioSystem.setChannelVolume('music', 0.5)
            audioSystem.muteChannel('sfx')
            audioSystem.unmuteChannel('sfx')
            audioSystem.stopChannel('music')
        })

        code('Spatial audio', () => {
            // Play sound at position
            const source = audioSystem.playAt('explosion', 10, 5, {
                refDistance: 2,
                maxDistance: 20,
                rolloffFactor: 1
            })

            // Update listener position (player position)
            audioSystem.setListenerPosition(playerX, playerY)

            // Update sound position
            source.setPosition(enemyX, enemyY)
        })

    })

})
