import {describe, test, expect, beforeEach} from 'vitest'
import './overlay.js'


describe('Overlay', () => {

    let overlay

    beforeEach(() => {
        overlay = document.createElement('editor-overlay')
        document.body.appendChild(overlay)
    })


    test('creates component with shadow DOM', () => {
        expect(overlay.shadowRoot).toBeTruthy()
    })


    test('is closed by default', () => {
        expect(overlay.isOpen).toBe(false)
        expect(overlay.hasAttribute('open')).toBe(false)
    })


    test('opens with open() method', () => {
        overlay.open()
        expect(overlay.isOpen).toBe(true)
        expect(overlay.hasAttribute('open')).toBe(true)
    })


    test('closes with close() method', () => {
        overlay.open()
        overlay.close()
        expect(overlay.isOpen).toBe(false)
        expect(overlay.hasAttribute('open')).toBe(false)
    })


    test('toggles with toggle() method', () => {
        expect(overlay.isOpen).toBe(false)

        overlay.toggle()
        expect(overlay.isOpen).toBe(true)

        overlay.toggle()
        expect(overlay.isOpen).toBe(false)
    })


    test('emits open event', () => {
        let eventFired = false
        overlay.addEventListener('open', () => {
            eventFired = true
        })

        overlay.open()
        expect(eventFired).toBe(true)
    })


    test('emits close event', () => {
        let eventFired = false
        overlay.addEventListener('close', () => {
            eventFired = true
        })

        overlay.open()
        overlay.close()
        expect(eventFired).toBe(true)
    })


    test('does not emit open event if already open', () => {
        overlay.open()

        let eventCount = 0
        overlay.addEventListener('open', () => {
            eventCount++
        })

        overlay.open()
        expect(eventCount).toBe(0)
    })


    test('does not emit close event if already closed', () => {
        let eventCount = 0
        overlay.addEventListener('close', () => {
            eventCount++
        })

        overlay.close()
        expect(eventCount).toBe(0)
    })


    test('has backdrop element', () => {
        const backdrop = overlay.shadowRoot.querySelector('.backdrop')
        expect(backdrop).toBeTruthy()
    })


    test('has container element', () => {
        const container = overlay.shadowRoot.querySelector('.container')
        expect(container).toBeTruthy()
    })


    test('has default slot for content', () => {
        const slot = overlay.shadowRoot.querySelector('slot')
        expect(slot).toBeTruthy()
    })


    test('closes on backdrop click by default', () => {
        overlay.open()

        const backdrop = overlay.shadowRoot.querySelector('.backdrop')
        backdrop.click()

        expect(overlay.isOpen).toBe(false)
    })


    test('does not close on backdrop click with no-close-on-backdrop', () => {
        overlay.setAttribute('no-close-on-backdrop', '')
        overlay.open()

        const backdrop = overlay.shadowRoot.querySelector('.backdrop')
        backdrop.click()

        expect(overlay.isOpen).toBe(true)
    })

})
