import {describe, test, expect, vi, beforeEach} from 'vitest'
import './side_drawer.js'


if (typeof PointerEvent === 'undefined') {
    globalThis.PointerEvent = class PointerEvent extends MouseEvent {
        constructor (type, params) {
            super(type, params)
            this.pointerType = params?.pointerType || 'mouse'
            this.pointerId = params?.pointerId || 1
        }
    }
}


describe('SideDrawer', () => {

    let drawer

    beforeEach(() => {
        drawer = document.createElement('side-drawer')
        drawer.setPointerCapture = vi.fn()
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


    test('observedAttributes includes open', () => {
        expect(drawer.constructor.observedAttributes).toContain('open')
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


    test('close button click closes drawer', () => {
        drawer.open()
        const closeBtn = drawer.shadowRoot.querySelector('.drawer-close')
        closeBtn.click()
        expect(drawer.isOpen).toBe(false)
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


    describe('swipe to close', () => {

        test('adds dragging class on pointerdown', () => {
            drawer.open()
            drawer.dispatchEvent(new PointerEvent('pointerdown', {
                clientX: 100,
                bubbles: true
            }))
            expect(drawer.classList.contains('dragging')).toBe(true)
        })


        test('removes dragging class on pointerup', () => {
            drawer.open()
            drawer.dispatchEvent(new PointerEvent('pointerdown', {
                clientX: 100,
                bubbles: true
            }))
            drawer.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}))
            expect(drawer.classList.contains('dragging')).toBe(false)
        })


        test('closes drawer when swiped past threshold for left position', () => {
            drawer.open()
            drawer.dispatchEvent(new PointerEvent('pointerdown', {
                clientX: 100,
                bubbles: true
            }))
            drawer.dispatchEvent(new PointerEvent('pointermove', {
                clientX: 40,
                bubbles: true
            }))
            drawer.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}))
            expect(drawer.isOpen).toBe(false)
        })


        test('does not close drawer when swipe is below threshold', () => {
            drawer.open()
            drawer.dispatchEvent(new PointerEvent('pointerdown', {
                clientX: 100,
                bubbles: true
            }))
            drawer.dispatchEvent(new PointerEvent('pointermove', {
                clientX: 80,
                bubbles: true
            }))
            drawer.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}))
            expect(drawer.isOpen).toBe(true)
        })


        test('closes drawer when swiped past threshold for right position', () => {
            drawer.setAttribute('position', 'right')
            drawer.open()
            drawer.dispatchEvent(new PointerEvent('pointerdown', {
                clientX: 100,
                bubbles: true
            }))
            drawer.dispatchEvent(new PointerEvent('pointermove', {
                clientX: 160,
                bubbles: true
            }))
            drawer.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}))
            expect(drawer.isOpen).toBe(false)
        })


        test('removes dragging class on pointercancel', () => {
            drawer.open()
            drawer.dispatchEvent(new PointerEvent('pointerdown', {
                clientX: 100,
                bubbles: true
            }))
            drawer.dispatchEvent(new PointerEvent('pointercancel', {bubbles: true}))
            expect(drawer.classList.contains('dragging')).toBe(false)
        })


        test('resets transform style after drag ends', () => {
            drawer.open()
            drawer.dispatchEvent(new PointerEvent('pointerdown', {
                clientX: 100,
                bubbles: true
            }))
            drawer.dispatchEvent(new PointerEvent('pointermove', {
                clientX: 80,
                bubbles: true
            }))
            drawer.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}))
            expect(drawer.style.transform).toBe('')
        })

    })

})
