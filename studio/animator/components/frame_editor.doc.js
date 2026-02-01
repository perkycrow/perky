import {doc, section, text, code} from '../../../doc/runtime.js'


export default doc('Frame Editor', {advanced: true}, () => {

    text(`
        UI builder for editing a single animation frame's properties: duration
        multiplier and event tags. Used by [[AnimatorView@studio/animator]]
        when a frame is selected in the timeline.
    `)


    section('buildFrameEditor', () => {

        text(`
            Creates the full frame editing panel. Shows a preview thumbnail,
            a duration section with linked slider and number input, and an
            events section with chips, suggestions, and a text input for
            adding custom events.
        `)

        code('Usage', () => {
            const editor = buildFrameEditor(frame, {
                onFramesUpdate: () => save(),
                getSuggestions: (current) => allEvents.filter(e => !current.includes(e))
            })
        })

    })


    section('buildDurationSection', () => {

        text(`
            Creates the duration controls: a slider (0.5 to 3) and a number
            input (0.1 to 10) that stay in sync. Changing either updates the
            frame's \`duration\` property and calls the update callback.
        `)

    })


    section('buildEventsSection', () => {

        text(`
            Creates the events panel. Existing events appear as removable chips.
            Suggested events (from \`getSuggestions\`) appear as clickable buttons.
            A text input at the bottom lets you type custom event names and add
            them with Enter. Duplicate events are ignored.
        `)

    })

})
