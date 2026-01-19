import {doc, section, text, container} from '../../doc/runtime.js'
import './panel.js'


export default doc('Panel', {advanced: true}, () => {

    text(`
        A floating or docked panel for editor tools.
        Supports dragging, collapsing, and closing.
    `)


    section('Basic Panel', () => {

        text('A simple docked panel with title and content.')

        container({title: 'Docked panel', height: 200, preset: 'inspector'}, ctx => {
            const panel = document.createElement('editor-panel')
            panel.title = 'Properties'
            panel.style.width = '250px'

            const content = document.createElement('div')
            content.style.cssText = 'color:#888;font-size:12px;'
            content.textContent = 'Panel content goes here'
            panel.appendChild(content)

            ctx.container.appendChild(panel)
        })

    })


    section('Floating Panel', () => {

        text(`
            Use the \`floating\` attribute for draggable panels.
            Drag the header to move the panel.
        `)

        container({title: 'Floating panel', height: 300, preset: 'inspector'}, ctx => {
            ctx.container.style.position = 'relative'

            const panel = document.createElement('editor-panel')
            panel.title = 'Inspector'
            panel.setAttribute('floating', '')
            panel.style.cssText = 'left:20px;top:20px;width:200px;height:150px;'

            const content = document.createElement('div')
            content.style.cssText = 'color:#888;font-size:12px;'
            content.textContent = 'Drag the header to move'
            panel.appendChild(content)

            ctx.container.appendChild(panel)
        })

    })


    section('Collapsible', () => {

        text('Click the minus button to collapse/expand the panel.')

        container({title: 'Collapsible panel', height: 200, preset: 'inspector'}, ctx => {
            const panel = document.createElement('editor-panel')
            panel.title = 'Layers'
            panel.style.width = '250px'

            const list = document.createElement('div')
            list.style.cssText = 'display:flex;flex-direction:column;gap:4px;'
            list.innerHTML = `
                <div style="padding:4px 8px;background:#24242a;border-radius:4px;font-size:12px;color:#e4e4e8;">Layer 1</div>
                <div style="padding:4px 8px;background:#24242a;border-radius:4px;font-size:12px;color:#e4e4e8;">Layer 2</div>
                <div style="padding:4px 8px;background:#24242a;border-radius:4px;font-size:12px;color:#e4e4e8;">Layer 3</div>
            `
            panel.appendChild(list)

            ctx.container.appendChild(panel)
        })

    })


    section('Multiple Panels', () => {

        text('Panels can be stacked vertically.')

        container({title: 'Stacked panels', height: 350, preset: 'inspector'}, ctx => {
            const wrapper = document.createElement('div')
            wrapper.style.cssText = 'display:flex;flex-direction:column;gap:8px;width:250px;'

            const panel1 = document.createElement('editor-panel')
            panel1.title = 'Transform'
            panel1.innerHTML = '<div style="color:#888;font-size:12px;">Position, rotation, scale</div>'

            const panel2 = document.createElement('editor-panel')
            panel2.title = 'Sprite'
            panel2.innerHTML = '<div style="color:#888;font-size:12px;">Texture, frame, tint</div>'

            const panel3 = document.createElement('editor-panel')
            panel3.title = 'Animation'
            panel3.setAttribute('collapsed', '')
            panel3.innerHTML = '<div style="color:#888;font-size:12px;">Clips, keyframes</div>'

            wrapper.appendChild(panel1)
            wrapper.appendChild(panel2)
            wrapper.appendChild(panel3)

            ctx.container.appendChild(wrapper)
        })

    })


    section('Events', () => {

        text(`
            Panels emit events:
            - \`close\` - When close button (✕) is clicked
        `)

        container({title: 'Event handling', height: 200, preset: 'inspector'}, ctx => {
            const panel = document.createElement('editor-panel')
            panel.title = 'Closable Panel'
            panel.style.width = '250px'

            const log = document.createElement('div')
            log.style.cssText = 'color:#888;font-size:12px;'
            log.textContent = 'Click close button (✕)...'
            panel.appendChild(log)

            panel.addEventListener('close', () => {
                log.textContent = '❌ Close clicked!'
            })

            ctx.container.appendChild(panel)
        })

    })


    section('No Padding', () => {

        text('Use `no-padding` attribute for full-bleed content.')

        container({title: 'No padding', height: 200, preset: 'inspector'}, ctx => {
            const panel = document.createElement('editor-panel')
            panel.title = 'Preview'
            panel.setAttribute('no-padding', '')
            panel.style.width = '250px'

            const preview = document.createElement('div')
            preview.style.cssText = 'height:100px;background:#0d0d10;display:flex;align-items:center;justify-content:center;color:#888;font-size:12px;'
            preview.textContent = 'Full bleed content'
            panel.appendChild(preview)

            ctx.container.appendChild(panel)
        })

    })

})
