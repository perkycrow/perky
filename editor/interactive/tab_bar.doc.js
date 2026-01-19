import {doc, section, text, container, logger} from '../../doc/runtime.js'
import './tab_bar.js'


export default doc('TabBar', {advanced: true}, () => {

    text(`
        Tab selector for switching between views or modes.
        Emits "change" events with \`detail.value\`.
    `)


    section('Programmatic', () => {

        text('Use `setTabs()` to create tabs from data.')

        container({title: 'Programmatic tabs', height: 100, preset: 'centered'}, ctx => {
            const tabBar = document.createElement('tab-bar')
            tabBar.setTabs([
                {value: 'sprites', label: 'Sprites'},
                {value: 'animations', label: 'Animations'},
                {value: 'settings', label: 'Settings'}
            ])
            tabBar.value = 'sprites'

            tabBar.addEventListener('change', (e) => {
                logger.log('Selected:', e.detail.value)
            })

            ctx.container.appendChild(tabBar)
        })

    })


    section('Slotted', () => {

        text('Or use slots for custom tab content.')

        container({title: 'Slotted tabs', height: 100, preset: 'centered'}, ctx => {
            const tabBar = document.createElement('tab-bar')
            tabBar.value = 'edit'

            const tab1 = document.createElement('button')
            tab1.setAttribute('slot', 'tab')
            tab1.dataset.value = 'edit'
            tab1.textContent = '✏️ Edit'
            tabBar.appendChild(tab1)

            const tab2 = document.createElement('button')
            tab2.setAttribute('slot', 'tab')
            tab2.dataset.value = 'preview'
            tab2.textContent = '👁️ Preview'
            tabBar.appendChild(tab2)

            tabBar.addEventListener('change', (e) => {
                logger.log('Mode:', e.detail.value)
            })

            ctx.container.appendChild(tabBar)
        })

    })


    section('View Switcher', () => {

        text('Example: switching between different view modes.')

        container({title: 'View switcher', height: 150, preset: 'centered'}, ctx => {
            const col = ctx.column({gap: 16})

            const tabBar = document.createElement('tab-bar')
            tabBar.setTabs([
                {value: 'grid', label: '⊞ Grid'},
                {value: 'list', label: '☰ List'},
                {value: 'tree', label: '⊟ Tree'}
            ])
            tabBar.value = 'grid'
            col.appendChild(tabBar)

            const preview = document.createElement('div')
            preview.style.cssText = 'padding:16px;background:#1a1a1e;border-radius:8px;color:#888;font-size:12px;text-align:center;'
            preview.textContent = 'Grid view'
            col.appendChild(preview)

            tabBar.addEventListener('change', (e) => {
                preview.textContent = `${e.detail.value.charAt(0).toUpperCase() + e.detail.value.slice(1)} view`
            })
        })

    })


    section('Studio Context', () => {

        text('Use `context="studio"` for larger touch-friendly tabs.')

        container({title: 'Studio tabs', height: 120, preset: 'centered'}, ctx => {
            const tabBar = document.createElement('tab-bar')
            tabBar.setAttribute('context', 'studio')
            tabBar.setTabs([
                {value: 'draw', label: 'Draw'},
                {value: 'animate', label: 'Animate'},
                {value: 'export', label: 'Export'}
            ])
            tabBar.value = 'draw'

            tabBar.addEventListener('change', (e) => {
                logger.log('Tab:', e.detail.value)
            })

            ctx.container.appendChild(tabBar)
        })

    })

})
