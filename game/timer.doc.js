import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Timer from './timer.js'


export default doc('Timer', () => {

    text(`
        A countdown timer for game logic. Tracks duration, progress, and
        remaining time. Call \`update()\` each frame to decrement.
    `)


    section('Basic Usage', () => {

        text(`
            Create a timer with a duration, reset to start, update each frame.
        `)

        action('Countdown', () => {
            const timer = new Timer(1.0)
            timer.reset()

            logger.log('active:', timer.active)
            logger.log('progress:', timer.progress.toFixed(2))

            timer.update(0.5)
            logger.log('after 0.5s:')
            logger.log('  progress:', timer.progress.toFixed(2))
            logger.log('  remaining:', timer.remaining.toFixed(2))

            timer.update(0.5)
            logger.log('after 1.0s:')
            logger.log('  active:', timer.active)
            logger.log('  progress:', timer.progress.toFixed(2))
        })

        action('Detect completion', () => {
            const timer = new Timer(0.3)
            timer.reset()

            for (let i = 1; i <= 5; i++) {
                const completed = timer.update(0.1)
                logger.log(`tick ${i}: completed=${completed}, active=${timer.active}`)
            }
        })

    })


    section('Cooldowns', () => {

        text(`
            Timers are useful for cooldowns, delays, and time-based abilities.
        `)

        code('Ability cooldown', () => {
            class FireballAbility {
                constructor () {
                    this.cooldown = new Timer(2.0)
                }

                update (deltaTime) {
                    this.cooldown.update(deltaTime)
                }

                canCast () {
                    return !this.cooldown.active
                }

                cast () {
                    if (!this.canCast()) {
                        return false
                    }
                    this.cooldown.reset()
                    return true
                }
            }
        })

        code('Invincibility frames', () => {
            class Player {
                constructor () {
                    this.invincibility = new Timer(1.0)
                }

                update (deltaTime) {
                    this.invincibility.update(deltaTime)
                }

                damage (amount) {
                    if (this.invincibility.active) {
                        return false
                    }
                    this.invincibility.reset()
                    return true
                }
            }
        })

    })


    section('Progress', () => {

        text(`
            \`progress\` goes from 0 to 1 as the timer counts down.
            \`remaining\` is the inverse — 1 to 0.
        `)

        action('Progress vs remaining', () => {
            const timer = new Timer(1.0)
            timer.reset()

            for (let i = 0; i <= 4; i++) {
                logger.log(`t=${(i * 0.25).toFixed(2)}: progress=${timer.progress.toFixed(2)}, remaining=${timer.remaining.toFixed(2)}`)
                timer.update(0.25)
            }
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const timer = new Timer(2.0)
        })

        code('Properties', () => {
            // timer.duration - Total duration in seconds
            // timer.value - Current countdown value
            // timer.active - true if value > 0
            // timer.progress - 0 to 1 (elapsed / duration)
            // timer.remaining - 1 to 0 (value / duration)
        })

        code('Methods', () => {
            // reset(duration?) - Reset to duration (optionally set new duration)
            // clear() - Set value to 0 (inactive)
            // update(deltaTime) - Decrement, returns true if just completed
        })

    })

})
