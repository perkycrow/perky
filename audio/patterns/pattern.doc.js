import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import Pattern, {parsePattern} from './pattern.js'


export default doc('Pattern', () => {

    text(`
        A step sequencer pattern that fires events on a BPM clock.
        Steps can be note names, sound IDs, rests (\`.\` \`_\` \`~\`), or groups (\`[kick snare]\`).
        Extends [[PerkyModule]].
    `)


    section('Creating Patterns', () => {

        text('Pass a pattern string or an array of steps. Rests are represented by `.`, `_`, or `~`.')

        action('From string', () => {
            const pattern = new Pattern({
                pattern: 'kick . snare . kick kick snare .',
                bpm: 120
            })

            logger.log('Steps:', pattern.steps.length)
            logger.log('BPM:', pattern.bpm)
            logger.log('Loop:', pattern.loop)
        })

        action('From steps array', () => {
            const pattern = new Pattern({
                steps: ['kick', null, 'snare', null],
                bpm: 140
            })

            logger.log('Steps:', pattern.stepCount)
        })

    })


    section('Playback', () => {

        text(`
            Call \`play()\` to start and \`update(delta)\` each frame.
            The pattern emits \`step\` events as it advances through steps.
        `)

        code('Basic playback loop', () => {
            const pattern = new Pattern({pattern: 'C D E F G A B c', bpm: 120})

            pattern.onStep((step, index) => {
                logger.log('Step', index, ':', step)
            })

            pattern.play()

            // In your update loop:
            // pattern.update(deltaTime)
        })

    })


    section('Swing', () => {

        text('Swing delays every other step, creating a shuffle feel. Values range from 0 (straight) to 1 (maximum swing).')

        action('Swing demo', () => {
            const pattern = new Pattern({
                pattern: 'kick snare kick snare',
                bpm: 120,
                swing: 0.5
            })

            logger.log('Swing:', pattern.swing)

            pattern.setSwing(0.8)
            logger.log('Swing:', pattern.swing)
        })

    })


    section('Transformations', () => {

        text('Pattern methods that return new Pattern instances, leaving the original unchanged.')

        action('Map, reverse, fast, slow', () => {
            const original = new Pattern({pattern: 'kick snare hat hat', bpm: 120})

            const reversed = original.reverse()
            logger.log('Reversed:', reversed.steps)

            const faster = original.fast(2)
            logger.log('Fast BPM:', faster.bpm)

            const slower = original.slow(2)
            logger.log('Slow BPM:', slower.bpm)

            const mapped = original.map(step => (step === 'hat' ? 'clap' : step))
            logger.log('Mapped:', mapped.steps)
        })

    })


    section('parsePattern', () => {

        text('Exported utility that converts a pattern string into a steps array.')

        action('Parse examples', () => {
            logger.log(parsePattern('kick . snare .'))
            logger.log(parsePattern('[kick snare] hat . hat'))
            logger.log(parsePattern('C D E _ G'))
        })

    })

})
