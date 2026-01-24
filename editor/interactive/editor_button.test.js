import {describe, test, expect, vi, beforeEach} from 'vitest'
import './editor_button.js'


describe('EditorButton', () => {

    let button

    beforeEach(() => {
        button = document.createElement('editor-button')
        document.body.appendChild(button)
    })


    describe('constructor', () => {

        test('creates shadow root', () => {
            expect(button.shadowRoot).not.toBeNull()
        })

    })


    describe('connectedCallback', () => {

        test('renders button element', () => {
            const btn = button.shadowRoot.querySelector('button')
            expect(btn).not.toBeNull()
        })


        test('button has type button', () => {
            const btn = button.shadowRoot.querySelector('button')
            expect(btn.getAttribute('type')).toBe('button')
        })


        test('button contains slot', () => {
            const btn = button.shadowRoot.querySelector('button')
            expect(btn.innerHTML).toContain('slot')
        })

    })


    describe('variant property', () => {

        test('returns default when no attribute', () => {
            expect(button.variant).toBe('default')
        })


        test('returns attribute value', () => {
            button.setAttribute('variant', 'primary')
            expect(button.variant).toBe('primary')
        })


        test('setter updates attribute', () => {
            button.variant = 'danger'
            expect(button.getAttribute('variant')).toBe('danger')
        })


        test('applies variant class to button', () => {
            button.variant = 'primary'
            const btn = button.shadowRoot.querySelector('button')
            expect(btn.classList.contains('primary')).toBe(true)
        })


        test('does not add class for default variant', () => {
            button.variant = 'default'
            const btn = button.shadowRoot.querySelector('button')
            expect(btn.classList.contains('default')).toBe(false)
        })

    })


    describe('disabled property', () => {

        test('returns false when no attribute', () => {
            expect(button.disabled).toBe(false)
        })


        test('returns true when attribute present', () => {
            button.setAttribute('disabled', '')
            expect(button.disabled).toBe(true)
        })


        test('setter adds attribute when true', () => {
            button.disabled = true
            expect(button.hasAttribute('disabled')).toBe(true)
        })


        test('setter removes attribute when false', () => {
            button.setAttribute('disabled', '')
            button.disabled = false
            expect(button.hasAttribute('disabled')).toBe(false)
        })


        test('disables internal button', () => {
            button.disabled = true
            const btn = button.shadowRoot.querySelector('button')
            expect(btn.disabled).toBe(true)
        })

    })


    describe('active property', () => {

        test('returns false when no attribute', () => {
            expect(button.active).toBe(false)
        })


        test('returns true when attribute present', () => {
            button.setAttribute('active', '')
            expect(button.active).toBe(true)
        })


        test('setter adds attribute when true', () => {
            button.active = true
            expect(button.hasAttribute('active')).toBe(true)
        })


        test('setter removes attribute when false', () => {
            button.setAttribute('active', '')
            button.active = false
            expect(button.hasAttribute('active')).toBe(false)
        })


        test('applies active class to button', () => {
            button.active = true
            const btn = button.shadowRoot.querySelector('button')
            expect(btn.classList.contains('active')).toBe(true)
        })

    })


    describe('icon attribute', () => {

        test('applies icon-only class when icon attribute present', () => {
            button.setAttribute('icon', '')
            const btn = button.shadowRoot.querySelector('button')
            expect(btn.classList.contains('icon-only')).toBe(true)
        })

    })


    describe('click behavior', () => {

        test('dispatches press event on click', () => {
            const handler = vi.fn()
            button.addEventListener('press', handler)

            const btn = button.shadowRoot.querySelector('button')
            btn.click()

            expect(handler).toHaveBeenCalled()
        })


        test('press event bubbles', () => {
            const handler = vi.fn()
            document.body.addEventListener('press', handler)

            const btn = button.shadowRoot.querySelector('button')
            btn.click()

            expect(handler).toHaveBeenCalled()
            document.body.removeEventListener('press', handler)
        })


        test('does not dispatch press when disabled', () => {
            const handler = vi.fn()
            button.addEventListener('press', handler)
            button.disabled = true

            const btn = button.shadowRoot.querySelector('button')
            btn.click()

            expect(handler).not.toHaveBeenCalled()
        })

    })


    describe('focus methods', () => {

        test('focus calls internal button focus', () => {
            const btn = button.shadowRoot.querySelector('button')
            const spy = vi.spyOn(btn, 'focus')
            button.focus()
            expect(spy).toHaveBeenCalled()
        })


        test('blur calls internal button blur', () => {
            const btn = button.shadowRoot.querySelector('button')
            const spy = vi.spyOn(btn, 'blur')
            button.blur()
            expect(spy).toHaveBeenCalled()
        })


        test('click calls internal button click', () => {
            const btn = button.shadowRoot.querySelector('button')
            const spy = vi.spyOn(btn, 'click')
            button.click()
            expect(spy).toHaveBeenCalled()
        })

    })


    describe('attributeChangedCallback', () => {

        test('does not update if old and new values are same', () => {
            const btn = button.shadowRoot.querySelector('button')
            const initialClass = btn.className
            button.attributeChangedCallback('variant', 'primary', 'primary')
            expect(btn.className).toBe(initialClass)
        })

    })

})
