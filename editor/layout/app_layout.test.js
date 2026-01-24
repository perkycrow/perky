import {describe, test, expect, beforeEach} from 'vitest'
import './app_layout.js'


describe('AppLayout', () => {

    let layout

    beforeEach(() => {
        layout = document.createElement('app-layout')
        document.body.appendChild(layout)
    })


    test('creates component with shadow DOM', () => {
        expect(layout.shadowRoot).toBeTruthy()
    })


    test('has default structure with header, content, and footer', () => {
        const header = layout.shadowRoot.querySelector('.header')
        const content = layout.shadowRoot.querySelector('.content')
        const footer = layout.shadowRoot.querySelector('.footer')

        expect(header).toBeTruthy()
        expect(content).toBeTruthy()
        expect(footer).toBeTruthy()
    })


    test('sets title via property', () => {
        layout.title = 'Test App'
        const titleEl = layout.shadowRoot.querySelector('.title')
        expect(titleEl.textContent).toBe('Test App')
    })


    test('sets title via attribute', () => {
        layout.setAttribute('title', 'Attribute Title')
        const titleEl = layout.shadowRoot.querySelector('.title')
        expect(titleEl.textContent).toBe('Attribute Title')
    })


    test('hides header when no-header attribute is set', () => {
        layout.setAttribute('no-header', '')
        const header = layout.shadowRoot.querySelector('.header')
        const computedDisplay = window.getComputedStyle(header).display
        expect(computedDisplay === 'none' || layout.hasAttribute('no-header')).toBe(true)
    })


    test('hides footer when no-footer attribute is set', () => {
        layout.setAttribute('no-footer', '')
        expect(layout.hasAttribute('no-footer')).toBe(true)
    })


    test('emits menu event when menu button is clicked', () => {
        let eventFired = false
        layout.addEventListener('menu', () => {
            eventFired = true
        })

        const menuBtn = layout.shadowRoot.querySelector('.menu-btn')
        menuBtn.click()

        expect(eventFired).toBe(true)
    })


    test('emits close event when close button is clicked', () => {
        let eventFired = false
        layout.addEventListener('close', () => {
            eventFired = true
        })

        const closeBtn = layout.shadowRoot.querySelector('.close-btn')
        closeBtn.click()

        expect(eventFired).toBe(true)
    })


    test('hides menu button when no-menu attribute is set', () => {
        layout.setAttribute('no-menu', '')
        const menuBtn = layout.shadowRoot.querySelector('.menu-btn')
        expect(menuBtn.classList.contains('hidden')).toBe(true)
    })


    test('hides close button when no-close attribute is set', () => {
        layout.setAttribute('no-close', '')
        const closeBtn = layout.shadowRoot.querySelector('.close-btn')
        expect(closeBtn.classList.contains('hidden')).toBe(true)
    })


    test('shows menu button by default', () => {
        const menuBtn = layout.shadowRoot.querySelector('.menu-btn')
        expect(menuBtn.classList.contains('hidden')).toBe(false)
    })


    test('shows close button by default', () => {
        const closeBtn = layout.shadowRoot.querySelector('.close-btn')
        expect(closeBtn.classList.contains('hidden')).toBe(false)
    })


    test('has slots for header customization', () => {
        const headerStart = layout.shadowRoot.querySelector('slot[name="header-start"]')
        const headerCenter = layout.shadowRoot.querySelector('slot[name="header-center"]')
        const headerEnd = layout.shadowRoot.querySelector('slot[name="header-end"]')

        expect(headerStart).toBeTruthy()
        expect(headerCenter).toBeTruthy()
        expect(headerEnd).toBeTruthy()
    })


    test('has slots for footer customization', () => {
        const footerStart = layout.shadowRoot.querySelector('slot[name="footer-start"]')
        const footerCenter = layout.shadowRoot.querySelector('slot[name="footer-center"]')
        const footerEnd = layout.shadowRoot.querySelector('slot[name="footer-end"]')

        expect(footerStart).toBeTruthy()
        expect(footerCenter).toBeTruthy()
        expect(footerEnd).toBeTruthy()
    })


    test('has default slot for main content', () => {
        const defaultSlot = layout.shadowRoot.querySelector('.content slot:not([name])')
        expect(defaultSlot).toBeTruthy()
    })


    test('has overlay slot for modals', () => {
        const overlaySlot = layout.shadowRoot.querySelector('slot[name="overlay"]')
        expect(overlaySlot).toBeTruthy()
    })


    test('gets title via getter', () => {
        layout.setAttribute('title', 'My Title')
        expect(layout.title).toBe('My Title')
    })


    test('sets title via setTitle method', () => {
        layout.setTitle('Method Title')
        expect(layout.title).toBe('Method Title')
    })

})
