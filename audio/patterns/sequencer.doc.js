import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import Sequencer from './sequencer.js'


export default doc('Sequencer', () => {

    text(`
        Manages multiple [[Pattern]] instances and wires them to [[AudioSystem]].
        Note names like \`C\`, \`D\`, \`E\` auto-play as oscillators.
        Extends [[PerkyModule]].
    `)


    section('Basic Setup', () => {

        text('Create a sequencer and add named patterns. Patterns share the sequencer BPM by default.')

        action('Add patterns', () => {
            const seq = new Sequencer({bpm: 140})

            seq.addPattern('drums', 'kick . snare . kick kick snare .')
            seq.addPattern('melody', 'C . E G . . A .')

            logger.log('Pattern count:', seq.patternCount)
            logger.log('Has drums:', seq.hasPattern('drums'))
            logger.log('BPM:', seq.bpm)
        })

    })


    section('Playback', () => {

        text('Start and stop all patterns at once. Call `update(delta)` each frame while playing.')

        code('Play and stop', () => {
            const seq = new Sequencer({bpm: 120})
            seq.addPattern('beat', 'kick . snare .')

            seq.playPatterns()
            seq.playing // true

            // In your update loop:
            // seq.update(deltaTime)

            seq.stopPatterns()
            seq.playing // false
        })

    })


    section('BPM Control', () => {

        text('Changing the sequencer BPM updates all patterns.')

        action('Change BPM', () => {
            const seq = new Sequencer({bpm: 120})
            seq.addPattern('beat', 'kick . snare .')

            logger.log('BPM:', seq.bpm)

            seq.setBpm(180)
            logger.log('BPM:', seq.bpm)

            const pattern = seq.getPattern('beat')
            logger.log('Pattern BPM:', pattern.bpm)
        })

    })


    section('Pattern Management', () => {

        text('Add, remove, and query patterns by name.')

        action('Manage patterns', () => {
            const seq = new Sequencer({bpm: 120})

            seq.addPattern('drums', 'kick . snare .')
            seq.addPattern('bass', 'C . . E . . G .')
            logger.log('Count:', seq.patternCount)

            seq.removePattern('bass')
            logger.log('Count:', seq.patternCount)
            logger.log('Has bass:', seq.hasPattern('bass'))

            seq.clear()
            logger.log('Count after clear:', seq.patternCount)
        })

    })


    section('Sound Binding', () => {

        text(`
            When adding a pattern with a \`sounds\` map, steps are automatically
            routed to [[AudioSystem]] buffers. Unknown steps that match note names
            play as oscillators.
        `)

        code('Bind sounds', () => {
            const seq = new Sequencer({audioSystem, bpm: 140})

            seq.addPattern('drums', 'kick . snare . kick kick snare .', {
                sounds: {kick: 'kickSample', snare: 'snareSample'}
            })

            seq.addPattern('melody', 'C . E G . . A .')
        })

    })

})
