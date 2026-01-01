import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './number_input.js'


describe('NumberInput', () => {

    let input
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        input = document.createElement('number-input')
        container.appendChild(input)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('should extend HTMLElement', () => {
            expect(input).toBeInstanceOf(HTMLElement)
        })


        test('should have shadow DOM', () => {
            expect(input.shadowRoot).not.toBeNull()
        })


        test('should have default value of 0', () => {
            expect(input.value).toBe(0)
        })

    })


    describe('value property', () => {

        test('should get and set value', () => {
            input.value = 42
            expect(input.value).toBe(42)
        })


        test('should parse string values', () => {
            input.value = '3.14'
            expect(input.value).toBe(3.14)
        })


        test('should default invalid values to 0', () => {
            input.value = 'invalid'
            expect(input.value).toBe(0)
        })

    })


    describe('setValue', () => {

        test('should set value directly', () => {
            input.setValue(100)
            expect(input.value).toBe(100)
        })

    })


    describe('setStep', () => {

        test('should set step value', () => {
            input.setStep(0.5)
            expect(input.value).toBe(0)
        })

    })


    describe('setPrecision', () => {

        test('should set precision value', () => {
            input.setPrecision(3)
            input.setValue(1.23456)
            expect(input.value).toBe(1.23456)
        })

    })


    describe('setLabel', () => {

        test('should set label text', () => {
            input.setLabel('x')
            const label = input.shadowRoot.querySelector('.number-input-label')
            expect(label.textContent).toBe('x')
        })

    })


    describe('min/max constraints', () => {

        test('should clamp value to min', () => {
            input.setMin(0)
            input.value = -10
            expect(input.value).toBe(0)
        })


        test('should clamp value to max', () => {
            input.setMax(100)
            input.value = 200
            expect(input.value).toBe(100)
        })

    })


    describe('observedAttributes', () => {

        test('should include expected attributes', () => {
            const observed = input.constructor.observedAttributes
            expect(observed).toContain('value')
            expect(observed).toContain('step')
            expect(observed).toContain('precision')
            expect(observed).toContain('label')
            expect(observed).toContain('min')
            expect(observed).toContain('max')
        })

    })


    describe('change event', () => {

        test('should emit change event when value changes via stepper', () => {
            const handler = vi.fn()
            input.addEventListener('change', handler)

            const incrementBtn = input.shadowRoot.querySelectorAll('.number-input-stepper')[1]
            incrementBtn.click()

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.value).toBeGreaterThan(0)
        })

    })

})
