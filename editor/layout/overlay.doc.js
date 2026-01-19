import {doc, section, text, container, logger} from '../../doc/runtime.js'
import './overlay.js'
import '../interactive/editor_button.js'


export default doc('Overlay', {advanced: true}, () => {

    text(`
        Modal/popup container with backdrop.
        Click backdrop or press Escape to close.
    `)


    section('Basic Overlay', () => {

        text('Use `open()` and `close()` methods to control visibility.')

        container({title: 'Basic overlay', height: 150, preset: 'centered'}, ctx => {
            const btn = document.createElement('editor-button')
            btn.textContent = 'Open Overlay'
            btn.variant = 'primary'
            ctx.container.appendChild(btn)

            const overlay = document.createElement('editor-overlay')
            overlay.innerHTML = `
                <div style="padding:24px;text-align:center;">
                    <h3 style="margin:0 0 12px;color:#e4e4e8;font-size:16px;">Hello!</h3>
                    <p style="margin:0 0 16px;color:#888;font-size:14px;">Click backdrop to close</p>
                </div>
            `
            ctx.container.appendChild(overlay)

            btn.addEventListener('click', () => overlay.open())

            overlay.addEventListener('close', () => {
                logger.log('Overlay closed')
            })
        })

    })


    section('With Actions', () => {

        text('Add buttons inside the overlay for actions.')

        container({title: 'Overlay with actions', height: 150, preset: 'centered'}, ctx => {
            const btn = document.createElement('editor-button')
            btn.textContent = 'Confirm Dialog'
            ctx.container.appendChild(btn)

            const overlay = document.createElement('editor-overlay')

            const content = document.createElement('div')
            content.style.cssText = 'padding:24px;min-width:280px;'

            content.innerHTML = `
                <h3 style="margin:0 0 8px;color:#e4e4e8;font-size:16px;">Delete Item?</h3>
                <p style="margin:0 0 20px;color:#888;font-size:14px;">This action cannot be undone.</p>
            `

            const actions = document.createElement('div')
            actions.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;'

            const cancelBtn = document.createElement('editor-button')
            cancelBtn.textContent = 'Cancel'
            cancelBtn.addEventListener('click', () => {
                overlay.close()
                logger.log('Cancelled')
            })

            const deleteBtn = document.createElement('editor-button')
            deleteBtn.textContent = 'Delete'
            deleteBtn.variant = 'danger'
            deleteBtn.addEventListener('click', () => {
                overlay.close()
                logger.log('Deleted!')
            })

            actions.appendChild(cancelBtn)
            actions.appendChild(deleteBtn)
            content.appendChild(actions)
            overlay.appendChild(content)
            ctx.container.appendChild(overlay)

            btn.addEventListener('click', () => overlay.open())
        })

    })


    section('Position', () => {

        text('Use `position="top"` or `position="bottom"` to align the overlay.')

        container({title: 'Top position', height: 150, preset: 'centered'}, ctx => {
            const row = ctx.row({gap: 8})

            const topBtn = document.createElement('editor-button')
            topBtn.textContent = 'Top'
            row.appendChild(topBtn)

            const bottomBtn = document.createElement('editor-button')
            bottomBtn.textContent = 'Bottom'
            row.appendChild(bottomBtn)

            const topOverlay = document.createElement('editor-overlay')
            topOverlay.setAttribute('position', 'top')
            topOverlay.innerHTML = '<div style="padding:20px;color:#888;">Top aligned</div>'
            ctx.container.appendChild(topOverlay)

            const bottomOverlay = document.createElement('editor-overlay')
            bottomOverlay.setAttribute('position', 'bottom')
            bottomOverlay.innerHTML = '<div style="padding:20px;color:#888;">Bottom aligned</div>'
            ctx.container.appendChild(bottomOverlay)

            topBtn.addEventListener('click', () => topOverlay.open())
            bottomBtn.addEventListener('click', () => bottomOverlay.open())
        })

    })


    section('No Backdrop Close', () => {

        text('Use `no-close-on-backdrop` to prevent closing when clicking backdrop.')

        container({title: 'Must use button to close', height: 150, preset: 'centered'}, ctx => {
            const btn = document.createElement('editor-button')
            btn.textContent = 'Open Locked'
            ctx.container.appendChild(btn)

            const overlay = document.createElement('editor-overlay')
            overlay.setAttribute('no-close-on-backdrop', '')

            const content = document.createElement('div')
            content.style.cssText = 'padding:24px;text-align:center;'
            content.innerHTML = '<p style="margin:0 0 16px;color:#888;">Backdrop click disabled</p>'

            const closeBtn = document.createElement('editor-button')
            closeBtn.textContent = 'Close'
            closeBtn.variant = 'primary'
            closeBtn.addEventListener('click', () => overlay.close())
            content.appendChild(closeBtn)

            overlay.appendChild(content)
            ctx.container.appendChild(overlay)

            btn.addEventListener('click', () => overlay.open())
        })

    })


    section('Events', () => {

        text('Overlay emits `open` and `close` events.')

        container({title: 'Event handling', height: 150, preset: 'centered'}, ctx => {
            const btn = document.createElement('editor-button')
            btn.textContent = 'Toggle'
            ctx.container.appendChild(btn)

            const overlay = document.createElement('editor-overlay')
            overlay.innerHTML = '<div style="padding:24px;color:#888;">Press Escape or click backdrop</div>'
            ctx.container.appendChild(overlay)

            overlay.addEventListener('open', () => logger.log('Opened'))
            overlay.addEventListener('close', () => logger.log('Closed'))

            btn.addEventListener('click', () => overlay.toggle())
        })

    })

})
