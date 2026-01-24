import {describe, test, expect, vi, beforeEach} from 'vitest'
import './side_drawer.js'


describe('SideDrawer', () => {

    let drawer

    beforeEach(() => {
        drawer = document.createElement('side-drawer')
        document.body.appendChild(drawer)
    })


    describe('constructor', () => {

        test('creates shadow root', () => {
            expect(drawer.shadowRoot).not.toBeNull()
        })


        test('creates close button', () => {
            const closeBtn = drawer.shadowRoot.querySelector('.drawer-close')
            expect(closeBtn).not.toBeNull()
        })


        test('creates content container', () => {
            const content = drawer.shadowRoot.querySelector('.drawer-content')
            expect(content).not.toBeNull()
        })


        test('content contains slot', () => {
            const slot = drawer.shadowRoot.querySelector('slot')
            expect(slot).not.toBeNull()
        })

    })


    describe('observedAttributes', () => {

        test('observes open attribute', () => {
            expect(drawer.constructor.observedAttributes).toContain('open')
        })

    })


    describe('isOpen property', () => {

        test('returns false when no attribute', () => {
            expect(drawer.isOpen).toBe(false)
        })


        test('returns true when open attribute present', () => {
            drawer.setAttribute('open', '')
            expect(drawer.isOpen).toBe(true)
        })

    })


    describe('open method', () => {

        test('sets open attribute', () => {
            drawer.open()
            expect(drawer.hasAttribute('open')).toBe(true)
        })


        test('dispatches open event', () => {
            const handler = vi.fn()
            drawer.addEventListener('open', handler)
            drawer.open()
            expect(handler).toHaveBeenCalled()
        })


        test('open event bubbles', () => {
            const handler = vi.fn()
            document.body.addEventListener('open', handler)
            drawer.open()
            expect(handler).toHaveBeenCalled()
            document.body.removeEventListener('open', handler)
        })


        test('does not dispatch if already open', () => {
            drawer.setAttribute('open', '')
            const handler = vi.fn()
            drawer.addEventListener('open', handler)
            drawer.open()
            expect(handler).not.toHaveBeenCalled()
        })

    })


    describe('close method', () => {

        test('removes open attribute', () => {
            drawer.setAttribute('open', '')
            drawer.close()
            expect(drawer.hasAttribute('open')).toBe(false)
        })


        test('dispatches close event', () => {
            drawer.setAttribute('open', '')
            const handler = vi.fn()
            drawer.addEventListener('close', handler)
            drawer.close()
            expect(handler).toHaveBeenCalled()
        })


        test('close event bubbles', () => {
            drawer.setAttribute('open', '')
            const handler = vi.fn()
            document.body.addEventListener('close', handler)
            drawer.close()
            expect(handler).toHaveBeenCalled()
            document.body.removeEventListener('close', handler)
        })


        test('does not dispatch if already closed', () => {
            const handler = vi.fn()
            drawer.addEventListener('close', handler)
            drawer.close()
            expect(handler).not.toHaveBeenCalled()
        })

    })


    describe('toggle method', () => {

        test('opens when closed', () => {
            drawer.toggle()
            expect(drawer.isOpen).toBe(true)
        })


        test('closes when open', () => {
            drawer.setAttribute('open', '')
            drawer.toggle()
            expect(drawer.isOpen).toBe(false)
        })

    })


    describe('close button', () => {

        test('clicking close button closes drawer', () => {
            drawer.open()
            const closeBtn = drawer.shadowRoot.querySelector('.drawer-close')
            closeBtn.click()
            expect(drawer.isOpen).toBe(false)
        })

    })


    describe('position attribute', () => {

        test('defaults to left', () => {
            expect(drawer.getAttribute('position')).toBeNull()
        })


        test('can be set to right', () => {
            drawer.setAttribute('position', 'right')
            expect(drawer.getAttribute('position')).toBe('right')
        })

    })

})
