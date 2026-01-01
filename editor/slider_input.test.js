import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
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

        it('should extend HTMLElement', () => {
            expect(slider).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(slider.shadowRoot).not.toBeNull()
        })


        it('should have default value of 0', () => {
            expect(slider.value).toBe(0)
        })

    })


    describe('value property', () => {

        it('should get and set value', () => {
            slider.value = 50
            expect(slider.value).toBe(50)
        })


        it('should parse string values', () => {
            slider.value = '75'
            expect(slider.value).toBe(75)
        })


        it('should default invalid values to 0', () => {
            slider.value = 'invalid'
            expect(slider.value).toBe(0)
        })


        it('should clamp value to min', () => {
            slider.setMin(10)
            slider.value = 5
            expect(slider.value).toBe(10)
        })


        it('should clamp value to max', () => {
            slider.setMax(50)
            slider.value = 100
            expect(slider.value).toBe(50)
        })

    })


    describe('setValue', () => {

        it('should set value directly', () => {
            slider.setValue(42)
            expect(slider.value).toBe(42)
        })

    })


    describe('setMin', () => {

        it('should set min value', () => {
            slider.setMin(10)
            const range = slider.shadowRoot.querySelector('input[type="range"]')
            expect(range.min).toBe('10')
        })

    })


    describe('setMax', () => {

        it('should set max value', () => {
            slider.setMax(200)
            const range = slider.shadowRoot.querySelector('input[type="range"]')
            expect(range.max).toBe('200')
        })

    })


    describe('setStep', () => {

        it('should set step value', () => {
            slider.setStep(5)
            const range = slider.shadowRoot.querySelector('input[type="range"]')
            expect(range.step).toBe('5')
        })

    })


    describe('setLabel', () => {

        it('should set label text', () => {
            slider.setLabel('Volume')
            const label = slider.shadowRoot.querySelector('.slider-input-label')
            expect(label.textContent).toBe('Volume')
        })

    })


    describe('observedAttributes', () => {

        it('should include expected attributes', () => {
            const observed = slider.constructor.observedAttributes
            expect(observed).toContain('value')
            expect(observed).toContain('min')
            expect(observed).toContain('max')
            expect(observed).toContain('step')
            expect(observed).toContain('label')
        })

    })


    describe('change event', () => {

        it('should emit change event when slider moved', () => {
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

        it('should display formatted value', () => {
            slider.setValue(42.123)
            const valueEl = slider.shadowRoot.querySelector('.slider-input-value')
            expect(valueEl.textContent).toBe('42.12')
        })


        it('should display more precision for small values', () => {
            slider.setValue(0.001)
            const valueEl = slider.shadowRoot.querySelector('.slider-input-value')
            expect(valueEl.textContent).toBe('0.001')
        })

    })

})
