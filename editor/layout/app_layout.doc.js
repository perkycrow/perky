import {doc, section, text, container} from '../../doc/runtime.js'
import './app_layout.js'
import '../interactive/editor_button.js'


export default doc('AppLayout', {advanced: true}, () => {

    text(`
        A fullscreen layout for apps with header, content, and footer areas.
        Designed for iPad Pro with touch-friendly controls and safe area support.
    `)


    section('Basic Structure', () => {

        text(`
            The layout has three main areas:
            - **Header**: Title, menu button, close button, and custom slots
            - **Content**: Main area (default slot)
            - **Footer**: Actions and toolbar (optional)
        `)

        container({title: 'Basic layout', height: 300, preset: 'inspector'}, ctx => {
            const layout = document.createElement('app-layout')
            layout.title = 'My App'
            layout.style.height = '100%'

            const content = document.createElement('div')
            content.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;color:#888;'
            content.textContent = 'Content area'
            layout.appendChild(content)

            ctx.container.appendChild(layout)
        })

    })


    section('With Footer', () => {

        text('Add elements to footer slots for actions.')

        container({title: 'Layout with footer', height: 300, preset: 'inspector'}, ctx => {
            const layout = document.createElement('app-layout')
            layout.title = 'Sprite Animator'
            layout.style.height = '100%'

            const content = document.createElement('div')
            content.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;background:#0d0d10;'
            content.textContent = 'Preview area'
            layout.appendChild(content)

            // Footer start
            const backBtn = document.createElement('editor-button')
            backBtn.setAttribute('slot', 'footer-start')
            backBtn.setAttribute('icon', '')
            backBtn.textContent = '◀'
            layout.appendChild(backBtn)

            // Footer center
            const playBtn = document.createElement('editor-button')
            playBtn.setAttribute('slot', 'footer-center')
            playBtn.setAttribute('icon', '')
            playBtn.textContent = '▶'
            layout.appendChild(playBtn)

            const stopBtn = document.createElement('editor-button')
            stopBtn.setAttribute('slot', 'footer-center')
            stopBtn.setAttribute('icon', '')
            stopBtn.textContent = '■'
            layout.appendChild(stopBtn)

            // Footer end
            const exportBtn = document.createElement('editor-button')
            exportBtn.setAttribute('slot', 'footer-end')
            exportBtn.variant = 'primary'
            exportBtn.textContent = 'Export'
            layout.appendChild(exportBtn)

            ctx.container.appendChild(layout)
        })

    })


    section('Header Slots', () => {

        text('Customize header with `header-start`, `header-center`, and `header-end` slots.')

        container({title: 'Custom header', height: 300, preset: 'inspector'}, ctx => {
            const layout = document.createElement('app-layout')
            layout.style.height = '100%'

            // Header center - custom title area
            const select = document.createElement('select')
            select.setAttribute('slot', 'header-center')
            select.style.cssText = 'padding:8px 12px;border-radius:8px;background:#24242a;color:#e4e4e8;border:none;'
            select.innerHTML = '<option>Animation 1</option><option>Animation 2</option><option>Animation 3</option>'
            layout.appendChild(select)

            // Header end - custom actions
            const settingsBtn = document.createElement('editor-button')
            settingsBtn.setAttribute('slot', 'header-end')
            settingsBtn.setAttribute('icon', '')
            settingsBtn.setAttribute('variant', 'ghost')
            settingsBtn.textContent = '⚙'
            layout.appendChild(settingsBtn)

            const content = document.createElement('div')
            content.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;color:#888;'
            content.textContent = 'Content'
            layout.appendChild(content)

            ctx.container.appendChild(layout)
        })

    })


    section('No Header/Footer', () => {

        text('Use `no-header` or `no-footer` attributes to hide those areas.')

        container({title: 'Content only', height: 200, preset: 'inspector'}, ctx => {
            const layout = document.createElement('app-layout')
            layout.setAttribute('no-header', '')
            layout.setAttribute('no-footer', '')
            layout.style.height = '100%'

            const content = document.createElement('div')
            content.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;background:#0d0d10;color:#888;'
            content.textContent = 'Fullscreen content (no header/footer)'
            layout.appendChild(content)

            ctx.container.appendChild(layout)
        })

    })


    section('Events', () => {

        text(`
            The layout emits events:
            - \`menu\` - When menu button (≡) is clicked
            - \`close\` - When close button (✕) is clicked
        `)

        container({title: 'Event handling', height: 200, preset: 'inspector'}, ctx => {
            const layout = document.createElement('app-layout')
            layout.title = 'Event Demo'
            layout.style.height = '100%'

            const log = document.createElement('div')
            log.style.cssText = 'padding:16px;color:#888;font-size:12px;'
            log.textContent = 'Click menu (≡) or close (✕) buttons...'
            layout.appendChild(log)

            layout.addEventListener('menu', () => {
                log.textContent = '📋 Menu clicked!'
            })

            layout.addEventListener('close', () => {
                log.textContent = '❌ Close clicked!'
            })

            ctx.container.appendChild(layout)
        })

    })

})
