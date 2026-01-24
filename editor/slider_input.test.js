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

        test('extends HTMLElement', () => {
            expect(slider).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(slider.shadowRoot).not.toBeNull()
        })


        test('has default value of 0', () => {
            expect(slider.value).toBe(0)
        })

    })


    describe('value property', () => {

        test('gets and sets value', () => {
            slider.value = 50
            expect(slider.value).toBe(50)
        })


        test('parses string values', () => {
            slider.value = '75'
            expect(slider.value).toBe(75)
        })


        test('defaults invalid values to 0', () => {
            slider.value = 'invalid'
            expect(slider.value).toBe(0)
        })


        test('clamps value to min', () => {
            slider.setMin(10)
            slider.value = 5
            expect(slider.value).toBe(10)
        })


        test('clamps value to max', () => {
            slider.setMax(50)
            slider.value = 100
            expect(slider.value).toBe(50)
        })

    })


    test('setValue sets value directly', () => {
        slider.setValue(42)
        expect(slider.value).toBe(42)
    })


    test('setMin sets min value', () => {
        slider.setMin(10)
        const range = slider.shadowRoot.querySelector('input[type="range"]')
        expect(range.min).toBe('10')
    })


    test('setMax sets max value', () => {
        slider.setMax(200)
        const range = slider.shadowRoot.querySelector('input[type="range"]')
        expect(range.max).toBe('200')
    })


    test('setStep sets step value', () => {
        slider.setStep(5)
        const range = slider.shadowRoot.querySelector('input[type="range"]')
        expect(range.step).toBe('5')
    })


    test('setLabel sets label text', () => {
        slider.setLabel('Volume')
        const label = slider.shadowRoot.querySelector('.slider-input-label')
        expect(label.textContent).toBe('Volume')
    })


    test('observedAttributes includes expected attributes', () => {
        const observed = slider.constructor.observedAttributes
        expect(observed).toContain('value')
        expect(observed).toContain('min')
        expect(observed).toContain('max')
        expect(observed).toContain('step')
        expect(observed).toContain('label')
    })


    test('change event emits change event when slider moved', () => {
        const handler = vi.fn()
        slider.addEventListener('change', handler)

        const range = slider.shadowRoot.querySelector('input[type="range"]')
        range.value = 50
        range.dispatchEvent(new Event('input'))

        expect(handler).toHaveBeenCalled()
        expect(handler.mock.calls[0][0].detail.value).toBe(50)
    })


    describe('value display', () => {

        test('displays formatted value', () => {
            slider.setValue(42.123)
            const valueEl = slider.shadowRoot.querySelector('.slider-input-value')
            expect(valueEl.textContent).toBe('42.12')
        })


        test('displays more precision for small values', () => {
            slider.setValue(0.001)
            const valueEl = slider.shadowRoot.querySelector('.slider-input-value')
            expect(valueEl.textContent).toBe('0.001')
        })

    })

})
