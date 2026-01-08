import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './volume_input.js'


describe('VolumeInput', () => {

    let volumeInput
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        volumeInput = document.createElement('volume-input')
        container.appendChild(volumeInput)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('should extend HTMLElement', () => {
            expect(volumeInput).toBeInstanceOf(HTMLElement)
        })


        test('should have shadow DOM', () => {
            expect(volumeInput.shadowRoot).not.toBeNull()
        })


        test('should have default value of 1', () => {
            expect(volumeInput.value).toBe(1)
        })

    })


    describe('value property', () => {

        test('should get and set value', () => {
            volumeInput.value = 0.5
            expect(volumeInput.value).toBe(0.5)
        })


        test('should parse string values', () => {
            volumeInput.value = '0.75'
            expect(volumeInput.value).toBe(0.75)
        })


        test('should default invalid values to 0', () => {
            volumeInput.value = 'invalid'
            expect(volumeInput.value).toBe(0)
        })


        test('should clamp value to 0 minimum', () => {
            volumeInput.value = -0.5
            expect(volumeInput.value).toBe(0)
        })


        test('should clamp value to 1 maximum', () => {
            volumeInput.value = 1.5
            expect(volumeInput.value).toBe(1)
        })


        test('should accept 0', () => {
            volumeInput.value = 0
            expect(volumeInput.value).toBe(0)
        })


        test('should accept 1', () => {
            volumeInput.value = 1
            expect(volumeInput.value).toBe(1)
        })

    })


    test('setValue should set value directly and clamp', () => {
        volumeInput.setValue(0.42)
        expect(volumeInput.value).toBe(0.42)

        volumeInput.setValue(2)
        expect(volumeInput.value).toBe(1)

        volumeInput.setValue(-1)
        expect(volumeInput.value).toBe(0)
    })


    test('setLabel should set label text', () => {
        volumeInput.setLabel('Master Volume')
        const label = volumeInput.shadowRoot.querySelector('.volume-input-label')
        expect(label.textContent).toBe('Master Volume')
    })


    test('observedAttributes should include expected attributes', () => {
        const observed = volumeInput.constructor.observedAttributes
        expect(observed).toContain('value')
        expect(observed).toContain('label')
    })


    test('change event should emit change event when slider moved', () => {
        const handler = vi.fn()
        volumeInput.addEventListener('change', handler)

        const range = volumeInput.shadowRoot.querySelector('input[type="range"]')
        range.value = 0.5
        range.dispatchEvent(new Event('input'))

        expect(handler).toHaveBeenCalled()
        expect(handler.mock.calls[0][0].detail.value).toBe(0.5)
    })


    describe('value display', () => {

        test('should display value as percentage', () => {
            volumeInput.setValue(0.5)
            const valueEl = volumeInput.shadowRoot.querySelector('.volume-input-value')
            expect(valueEl.textContent).toBe('50%')
        })


        test('should display 0% for zero', () => {
            volumeInput.setValue(0)
            const valueEl = volumeInput.shadowRoot.querySelector('.volume-input-value')
            expect(valueEl.textContent).toBe('0%')
        })


        test('should display 100% for one', () => {
            volumeInput.setValue(1)
            const valueEl = volumeInput.shadowRoot.querySelector('.volume-input-value')
            expect(valueEl.textContent).toBe('100%')
        })


        test('should round percentage to nearest integer', () => {
            volumeInput.setValue(0.756)
            const valueEl = volumeInput.shadowRoot.querySelector('.volume-input-value')
            expect(valueEl.textContent).toBe('76%')
        })

    })


    describe('range input attributes', () => {

        test('should have min of 0', () => {
            const range = volumeInput.shadowRoot.querySelector('input[type="range"]')
            expect(range.min).toBe('0')
        })


        test('should have max of 1', () => {
            const range = volumeInput.shadowRoot.querySelector('input[type="range"]')
            expect(range.max).toBe('1')
        })


        test('should have step of 0.01', () => {
            const range = volumeInput.shadowRoot.querySelector('input[type="range"]')
            expect(range.step).toBe('0.01')
        })

    })

})
