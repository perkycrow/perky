import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import SpriteEffect from './sprite_effect.js'


export default doc('SpriteEffect', () => {

    text(`
        Base class for all sprite visual effects.
        Subclass this to create custom effects that modify how sprites are rendered.
        See [[SpriteEffectStack@render]] for managing effects on sprites.
    `)


    section('Creating an Effect', () => {

        text('Effects are simple objects with an enabled state and a type identifier.')

        action('Default effect', () => {
            const effect = new SpriteEffect()

            logger.log('type:', effect.type)
            logger.log('enabled:', effect.enabled)
        })

        action('Created disabled', () => {
            const effect = new SpriteEffect({enabled: false})

            logger.log('enabled:', effect.enabled)
        })

    })


    section('Enabled', () => {

        text('Toggle effects on and off at runtime without removing them from the stack.')

        action('Toggle enabled', () => {
            const effect = new SpriteEffect()

            logger.log('default:', effect.enabled)

            effect.enabled = false
            logger.log('after disable:', effect.enabled)

            effect.enabled = true
            logger.log('after enable:', effect.enabled)
        })

    })


    section('Subclassing', () => {

        text(`
            Override these methods to create a custom effect:

            - \`getHints()\` — return an object with effect parameters for the shader.
            - \`update(deltaTime)\` — called each frame to animate effect properties.
            - \`dispose()\` — clean up resources.
        `)

        code('Custom effect skeleton', () => {
            class MyEffect extends SpriteEffect {

                static type = 'my-effect'

                getHints () {
                    return {intensity: 0.5}
                }

                update (deltaTime) {
                    // Animate properties per frame
                }

                dispose () {
                    // Clean up
                }

            }
        })

    })

})
