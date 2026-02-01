import {doc, section, text, code} from '../../../doc/runtime.js'


export default doc('Animation Settings', {advanced: true}, () => {

    text(`
        UI builder for editing an animation's properties: name, motion mode,
        direction, speed, and a delete action. Used by [[AnimatorView@studio/animator]]
        in the settings drawer.
    `)


    section('buildAnimationSettings', () => {

        text(`
            Creates the full settings panel for an animation. Includes a name
            input that auto-resolves duplicates via camelCase conversion, plus
            motion controls and a delete button with confirmation. Returns the
            container, the name input, and a \`rebuild(animation)\` method for
            switching animations without recreating the whole panel.
        `)

        code('Usage', () => {
            const {container, nameInput, rebuild} = buildAnimationSettings(
                animator,
                selectedAnimation,
                {
                    onRename: (name) => handleRename(name),
                    onMotionChange: (motion) => preview.setMotion(motion),
                    onMotionUpdate: (motion) => preview.setMotion(motion),
                    onDelete: () => deleteAnimation()
                }
            )

            rebuild(newAnimation)
        })

    })


    section('buildAnimationSettingsContent', () => {

        text(`
            Builds the motion section: a mode selector (none / sidescroller /
            top-down), a direction pad, and a speed slider. Appended to the
            container with \`data-setting\` attributes so \`rebuild()\` can
            replace them individually.
        `)

    })


    section('rebuildDirectionPad', () => {

        text(`
            Renders a 3x3 grid of direction buttons. Sidescroller mode shows
            N/E/S/W, top-down mode shows all eight directions. The active
            direction is highlighted and clicking a button updates the
            animation's motion config.
        `)

    })

})
