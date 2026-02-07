import {doc, section, text, container, logger} from '../../doc/runtime.js'
import './editor_button.js'


export default doc('EditorButton', {advanced: true}, () => {

    text(`
        A standardized button component using the shared styles system.
        Supports variants (default, primary, danger, ghost), icon mode,
        and active toggle state.
    `)


    section('Variants', () => {

        text('Different button styles for different purposes.')

        container({title: 'Button variants', height: 120, preset: 'centered'}, ctx => {
            const row = ctx.row({gap: 12})

            const defaultBtn = document.createElement('editor-button')
            defaultBtn.textContent = 'Default'
            row.appendChild(defaultBtn)

            const primaryBtn = document.createElement('editor-button')
            primaryBtn.variant = 'primary'
            primaryBtn.textContent = 'Primary'
            row.appendChild(primaryBtn)

            const dangerBtn = document.createElement('editor-button')
            dangerBtn.variant = 'danger'
            dangerBtn.textContent = 'Danger'
            row.appendChild(dangerBtn)

            const ghostBtn = document.createElement('editor-button')
            ghostBtn.variant = 'ghost'
            ghostBtn.textContent = 'Ghost'
            row.appendChild(ghostBtn)
        })

    })


    section('Icon Buttons', () => {

        text('Square buttons for icons. Use the `icon` attribute.')

        container({title: 'Icon buttons', height: 120, preset: 'centered'}, ctx => {
            const row = ctx.row({gap: 12})

            const addBtn = document.createElement('editor-button')
            addBtn.setAttribute('icon', '')
            addBtn.textContent = '+'
            row.appendChild(addBtn)

            const playBtn = document.createElement('editor-button')
            playBtn.setAttribute('icon', '')
            playBtn.variant = 'primary'
            playBtn.textContent = '▶'
            row.appendChild(playBtn)

            const deleteBtn = document.createElement('editor-button')
            deleteBtn.setAttribute('icon', '')
            deleteBtn.variant = 'danger'
            deleteBtn.textContent = '✕'
            row.appendChild(deleteBtn)

            const menuBtn = document.createElement('editor-button')
            menuBtn.setAttribute('icon', '')
            menuBtn.variant = 'ghost'
            menuBtn.textContent = '≡'
            row.appendChild(menuBtn)
        })

    })


    section('Toggle State', () => {

        text('Buttons can have an active state for toggles.')

        container({title: 'Toggle button', height: 120, preset: 'centered'}, ctx => {
            const row = ctx.row({gap: 12})

            const toggle = document.createElement('editor-button')
            toggle.textContent = 'Loop'
            toggle.addEventListener('press', () => {
                toggle.active = !toggle.active
                logger.log('Loop:', toggle.active)
            })
            row.appendChild(toggle)

            const toggle2 = document.createElement('editor-button')
            toggle2.setAttribute('icon', '')
            toggle2.textContent = '⟳'
            toggle2.active = true
            toggle2.addEventListener('press', () => {
                toggle2.active = !toggle2.active
                logger.log('Repeat:', toggle2.active)
            })
            row.appendChild(toggle2)
        })

    })


    section('Disabled State', () => {

        text('Disabled buttons are not interactive.')

        container({title: 'Disabled buttons', height: 120, preset: 'centered'}, ctx => {
            const row = ctx.row({gap: 12})

            const btn1 = document.createElement('editor-button')
            btn1.textContent = 'Disabled'
            btn1.disabled = true
            row.appendChild(btn1)

            const btn2 = document.createElement('editor-button')
            btn2.variant = 'primary'
            btn2.textContent = 'Disabled'
            btn2.disabled = true
            row.appendChild(btn2)
        })

    })


    section('Press Event', () => {

        text('Listen to the `press` event for clicks.')

        container({title: 'Press event', height: 120, preset: 'centered'}, ctx => {
            const btn = document.createElement('editor-button')
            btn.variant = 'primary'
            btn.textContent = 'Click me'
            btn.addEventListener('press', () => {
                logger.log('Button pressed!')
            })
            ctx.container.appendChild(btn)
        })

    })


    section('Touch Adaptation', () => {

        text(`
            Buttons automatically adapt for touch devices via CSS media queries.
            On touch devices (pointer: coarse), buttons use larger touch targets.
        `)

        container({title: 'Touch-friendly sizing', height: 120, preset: 'centered'}, ctx => {
            const row = ctx.row({gap: 12})

            const btn1 = document.createElement('editor-button')
            btn1.textContent = 'Save'
            row.appendChild(btn1)

            const btn2 = document.createElement('editor-button')
            btn2.variant = 'primary'
            btn2.textContent = 'Submit'
            row.appendChild(btn2)

            const btn3 = document.createElement('editor-button')
            btn3.setAttribute('icon', '')
            btn3.textContent = '+'
            row.appendChild(btn3)
        })

    })

})
