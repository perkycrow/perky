import {doc, section, text, container} from '../../doc/runtime.js'
import './toolbar.js'
import '../interactive/editor_button.js'


export default doc('Toolbar', {advanced: true}, () => {

    text(`
        A horizontal toolbar with start, center, and end slots.
        Used for tool bars, status bars, and action areas.
    `)


    section('Basic Toolbar', () => {

        text('Simple toolbar with buttons.')

        container({title: 'Basic toolbar', height: 80, preset: 'inspector'}, ctx => {
            const toolbar = document.createElement('editor-toolbar')

            const btn1 = document.createElement('editor-button')
            btn1.textContent = '◀'
            btn1.setAttribute('icon', '')
            btn1.setAttribute('slot', 'start')
            toolbar.appendChild(btn1)

            const btn2 = document.createElement('editor-button')
            btn2.textContent = '▶'
            btn2.setAttribute('icon', '')
            toolbar.appendChild(btn2)

            const btn3 = document.createElement('editor-button')
            btn3.textContent = '■'
            btn3.setAttribute('icon', '')
            toolbar.appendChild(btn3)

            const btn4 = document.createElement('editor-button')
            btn4.textContent = 'Export'
            btn4.variant = 'primary'
            btn4.setAttribute('slot', 'end')
            toolbar.appendChild(btn4)

            ctx.container.appendChild(toolbar)
        })

    })


    section('Slots', () => {

        text('Use `start`, `center`, and `end` slots to position items.')

        container({title: 'Slot positions', height: 80, preset: 'inspector'}, ctx => {
            const toolbar = document.createElement('editor-toolbar')

            const left = document.createElement('span')
            left.setAttribute('slot', 'start')
            left.style.cssText = 'color:#888;font-size:12px;'
            left.textContent = 'Start'
            toolbar.appendChild(left)

            const middle = document.createElement('span')
            middle.setAttribute('slot', 'center')
            middle.style.cssText = 'color:#888;font-size:12px;'
            middle.textContent = 'Center'
            toolbar.appendChild(middle)

            const right = document.createElement('span')
            right.setAttribute('slot', 'end')
            right.style.cssText = 'color:#888;font-size:12px;'
            right.textContent = 'End'
            toolbar.appendChild(right)

            ctx.container.appendChild(toolbar)
        })

    })


    section('Compact Variant', () => {

        text('Use `variant="compact"` for smaller toolbars.')

        container({title: 'Compact toolbar', height: 80, preset: 'inspector'}, ctx => {
            const toolbar = document.createElement('editor-toolbar')
            toolbar.setAttribute('variant', 'compact')

            const label = document.createElement('span')
            label.style.cssText = 'color:#888;font-size:11px;'
            label.textContent = 'Frame: 1/24'
            toolbar.appendChild(label)

            const btn = document.createElement('editor-button')
            btn.textContent = '⚙'
            btn.setAttribute('icon', '')
            btn.setAttribute('variant', 'ghost')
            btn.setAttribute('slot', 'end')
            toolbar.appendChild(btn)

            ctx.container.appendChild(toolbar)
        })

    })


    section('Footer Variant', () => {

        text('Use `variant="footer"` for bottom toolbars.')

        container({title: 'Footer toolbar', height: 80, preset: 'inspector'}, ctx => {
            const toolbar = document.createElement('editor-toolbar')
            toolbar.setAttribute('variant', 'footer')

            const status = document.createElement('span')
            status.setAttribute('slot', 'start')
            status.style.cssText = 'color:#888;font-size:12px;'
            status.textContent = 'Ready'
            toolbar.appendChild(status)

            const version = document.createElement('span')
            version.setAttribute('slot', 'end')
            version.style.cssText = 'color:#666;font-size:11px;'
            version.textContent = 'v1.0.0'
            toolbar.appendChild(version)

            ctx.container.appendChild(toolbar)
        })

    })


    section('Animation Controls', () => {

        text('Example toolbar for animation playback.')

        container({title: 'Animation toolbar', height: 80, preset: 'inspector'}, ctx => {
            const toolbar = document.createElement('editor-toolbar')

            // Frame counter (start)
            const frame = document.createElement('span')
            frame.setAttribute('slot', 'start')
            frame.style.cssText = 'color:#888;font-size:12px;font-variant-numeric:tabular-nums;'
            frame.textContent = '1 / 24'
            toolbar.appendChild(frame)

            // Playback controls (center)
            const prev = document.createElement('editor-button')
            prev.textContent = '⏮'
            prev.setAttribute('icon', '')
            prev.setAttribute('variant', 'ghost')
            toolbar.appendChild(prev)

            const play = document.createElement('editor-button')
            play.textContent = '▶'
            play.setAttribute('icon', '')
            toolbar.appendChild(play)

            const next = document.createElement('editor-button')
            next.textContent = '⏭'
            next.setAttribute('icon', '')
            next.setAttribute('variant', 'ghost')
            toolbar.appendChild(next)

            // FPS (end)
            const fps = document.createElement('span')
            fps.setAttribute('slot', 'end')
            fps.style.cssText = 'color:#666;font-size:11px;'
            fps.textContent = '12 fps'
            toolbar.appendChild(fps)

            ctx.container.appendChild(toolbar)
        })

    })

})
