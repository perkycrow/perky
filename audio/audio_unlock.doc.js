import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import {onAudioUnlock, isAudioUnlocked} from './audio_unlock.js'


export default doc('AudioUnlock', () => {

    text(`
        Handles the browser's audio unlock requirement. Browsers block audio playback
        until a user interaction (click, touch, keydown, gamepad connect). This module
        listens for the first interaction and fires registered callbacks.
        [[AudioSystem]] uses it internally to resume the \`AudioContext\`.
    `)


    section('Usage', () => {

        text(`
            Register a callback with \`onAudioUnlock()\`. If the audio is already unlocked,
            the callback fires immediately. Otherwise it queues until the first user interaction.
        `)

        code('Register a callback', () => {
            onAudioUnlock(() => {
                logger.log('Audio is ready')
            })
        })

    })


    section('Check Unlock State', () => {

        text('Use `isAudioUnlocked()` to check whether the browser audio has been unlocked.')

        action('Check state', () => {
            logger.log('Audio unlocked:', isAudioUnlocked())
        })

    })

})
