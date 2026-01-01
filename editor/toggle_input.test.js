import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './toggle_input.js'


describe('ToggleInput', () => {

    let toggle
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        toggle = document.createElement('toggle-input')
        container.appendChild(toggle)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('should extend HTMLElement', () => {
            expect(toggle).toBeInstanceOf(HTMLElement)
        })


        test('should have shadow DOM', () => {
            expect(toggle.shadowRoot).not.toBeNull()
        })


        test('should have default checked of false', () => {
            expect(toggle.checked).toBe(false)
        })

    })


    describe('checked property', () => {

        test('should get and set checked', () => {
            toggle.checked = true
            expect(toggle.checked).toBe(true)
        })


        test('should coerce to boolean', () => {
            toggle.checked = 1
            expect(toggle.checked).toBe(true)

            toggle.checked = 0
            expect(toggle.checked).toBe(false)
        })

    })


    describe('setChecked', () => {

        test('should set checked directly', () => {
            toggle.setChecked(true)
            expect(toggle.checked).toBe(true)
        })

    })


    describe('setLabel', () => {

        test('should set label text', () => {
            toggle.setLabel('Enabled')
            const label = toggle.shadowRoot.querySelector('.toggle-input-label')
            expect(label.textContent).toBe('Enabled')
        })

    })


    describe('observedAttributes', () => {

        test('should include expected attributes', () => {
            const observed = toggle.constructor.observedAttributes
            expect(observed).toContain('checked')
            expect(observed).toContain('label')
        })

    })


    describe('visual state', () => {

        test('should add checked class when checked', () => {
            toggle.setChecked(true)
            const track = toggle.shadowRoot.querySelector('.toggle-input-track')
            expect(track.classList.contains('checked')).toBe(true)
        })


        test('should remove checked class when unchecked', () => {
            toggle.setChecked(true)
            toggle.setChecked(false)
            const track = toggle.shadowRoot.querySelector('.toggle-input-track')
            expect(track.classList.contains('checked')).toBe(false)
        })

    })


    describe('click behavior', () => {

        test('should toggle when track clicked', () => {
            const track = toggle.shadowRoot.querySelector('.toggle-input-track')
            track.click()
            expect(toggle.checked).toBe(true)

            track.click()
            expect(toggle.checked).toBe(false)
        })


        test('should toggle when label clicked', () => {
            toggle.setLabel('Test')
            const label = toggle.shadowRoot.querySelector('.toggle-input-label')
            label.click()
            expect(toggle.checked).toBe(true)
        })

    })


    describe('change event', () => {

        test('should emit change event when toggled', () => {
            const handler = vi.fn()
            toggle.addEventListener('change', handler)

            const track = toggle.shadowRoot.querySelector('.toggle-input-track')
            track.click()

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.checked).toBe(true)
        })


        test('should emit correct state in change event', () => {
            toggle.setChecked(true)

            const handler = vi.fn()
            toggle.addEventListener('change', handler)

            const track = toggle.shadowRoot.querySelector('.toggle-input-track')
            track.click()

            expect(handler.mock.calls[0][0].detail.checked).toBe(false)
        })

    })

})
