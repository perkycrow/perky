import {describe, it, expect, beforeEach} from 'vitest'
import './toolbar.js'


describe('Toolbar', () => {

    let toolbar

    beforeEach(() => {
        toolbar = document.createElement('editor-toolbar')
        document.body.appendChild(toolbar)
    })


    it('creates component with shadow DOM', () => {
        expect(toolbar.shadowRoot).toBeTruthy()
    })


    it('has start, center, and end sections', () => {
        const start = toolbar.shadowRoot.querySelector('.toolbar-start')
        const center = toolbar.shadowRoot.querySelector('.toolbar-center')
        const end = toolbar.shadowRoot.querySelector('.toolbar-end')

        expect(start).toBeTruthy()
        expect(center).toBeTruthy()
        expect(end).toBeTruthy()
    })


    it('has slots for start, center, and end', () => {
        const startSlot = toolbar.shadowRoot.querySelector('slot[name="start"]')
        const centerSlot = toolbar.shadowRoot.querySelector('slot[name="center"]')
        const endSlot = toolbar.shadowRoot.querySelector('slot[name="end"]')

        expect(startSlot).toBeTruthy()
        expect(centerSlot).toBeTruthy()
        expect(endSlot).toBeTruthy()
    })


    it('has default slot for center content', () => {
        const defaultSlot = toolbar.shadowRoot.querySelector('.toolbar-center slot:not([name])')
        expect(defaultSlot).toBeTruthy()
    })


    it('accepts variant attribute', () => {
        toolbar.setAttribute('variant', 'compact')
        expect(toolbar.getAttribute('variant')).toBe('compact')
    })


    it('accepts footer variant', () => {
        toolbar.setAttribute('variant', 'footer')
        expect(toolbar.getAttribute('variant')).toBe('footer')
    })


    it('accepts no-border attribute', () => {
        toolbar.setAttribute('no-border', '')
        expect(toolbar.hasAttribute('no-border')).toBe(true)
    })

})
