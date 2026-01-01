import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './slider_input.js'


describe('SliderInput', () => {

    let slider
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        slider = document.createElement('slider-input')
        container.appendChild(slider)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('should extend HTMLElement', () => {
            expect(slider).toBeInstanceOf(HTMLElement)
        })


        test('should have shadow DOM', () => {
            expect(slider.shadowRoot).not.toBeNull()
        })


        test('should have default value of 0', () => {
            expect(slider.value).toBe(0)
        })

    })


    describe('value property', () => {

        test('should get and set value', () => {
            slider.value = 50
            expect(slider.value).toBe(50)
        })


        test('should parse string values', () => {
            slider.value = '75'
            expect(slider.value).toBe(75)
        })


        test('should default invalid values to 0', () => {
            slider.value = 'invalid'
            expect(slider.value).toBe(0)
        })


        test('should clamp value to min', () => {
            slider.setMin(10)
            slider.value = 5
            expect(slider.value).toBe(10)
        })


        test('should clamp value to max', () => {
            slider.setMax(50)
            slider.value = 100
            expect(slider.value).toBe(50)
        })

    })


    describe('setValue', () => {

        test('should set value directly', () => {
            slider.setValue(42)
            expect(slider.value).toBe(42)
        })

    })


    describe('setMin', () => {

        test('should set min value', () => {
            slider.setMin(10)
            const range = slider.shadowRoot.querySelector('input[type="range"]')
            expect(range.min).toBe('10')
        })

    })


    describe('setMax', () => {

        test('should set max value', () => {
            slider.setMax(200)
            const range = slider.shadowRoot.querySelector('input[type="range"]')
            expect(range.max).toBe('200')
        })

    })


    describe('setStep', () => {

        test('should set step value', () => {
            slider.setStep(5)
            const range = slider.shadowRoot.querySelector('input[type="range"]')
            expect(range.step).toBe('5')
        })

    })


    describe('setLabel', () => {

        test('should set label text', () => {
            slider.setLabel('Volume')
            const label = slider.shadowRoot.querySelector('.slider-input-label')
            expect(label.textContent).toBe('Volume')
        })

    })


    describe('observedAttributes', () => {

        test('should include expected attributes', () => {
            const observed = slider.constructor.observedAttributes
            expect(observed).toContain('value')
            expect(observed).toContain('min')
            expect(observed).toContain('max')
            expect(observed).toContain('step')
            expect(observed).toContain('label')
        })

    })


    describe('change event', () => {

        test('should emit change event when slider moved', () => {
            const handler = vi.fn()
            slider.addEventListener('change', handler)

            const range = slider.shadowRoot.querySelector('input[type="range"]')
            range.value = 50
            range.dispatchEvent(new Event('input'))

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.value).toBe(50)
        })

    })


    describe('value display', () => {

        test('should display formatted value', () => {
            slider.setValue(42.123)
            const valueEl = slider.shadowRoot.querySelector('.slider-input-value')
            expect(valueEl.textContent).toBe('42.12')
        })


        test('should display more precision for small values', () => {
            slider.setValue(0.001)
            const valueEl = slider.shadowRoot.querySelector('.slider-input-value')
            expect(valueEl.textContent).toBe('0.001')
        })

    })

})
