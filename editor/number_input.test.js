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

        test('extends HTMLElement', () => {
            expect(input).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(input.shadowRoot).not.toBeNull()
        })


        test('has default value of 0', () => {
            expect(input.value).toBe(0)
        })

    })


    describe('value property', () => {

        test('gets and sets value', () => {
            input.value = 42
            expect(input.value).toBe(42)
        })


        test('parses string values', () => {
            input.value = '3.14'
            expect(input.value).toBe(3.14)
        })


        test('defaults invalid values to 0', () => {
            input.value = 'invalid'
            expect(input.value).toBe(0)
        })

    })


    test('setValue should set value directly', () => {
        input.setValue(100)
        expect(input.value).toBe(100)
    })


    test('setStep should set step value', () => {
        input.setStep(0.5)
        expect(input.value).toBe(0)
    })


    test('setPrecision should set precision value', () => {
        input.setPrecision(3)
        input.setValue(1.23456)
        expect(input.value).toBe(1.23456)
    })


    test('setLabel should set label text', () => {
        input.setLabel('x')
        const label = input.shadowRoot.querySelector('.number-input-label')
        expect(label.textContent).toBe('x')
    })


    describe('min/max constraints', () => {

        test('clamps value to min', () => {
            input.setMin(0)
            input.value = -10
            expect(input.value).toBe(0)
        })


        test('clamps value to max', () => {
            input.setMax(100)
            input.value = 200
            expect(input.value).toBe(100)
        })

    })


    test('observedAttributes should include expected attributes', () => {
        const observed = input.constructor.observedAttributes
        expect(observed).toContain('value')
        expect(observed).toContain('step')
        expect(observed).toContain('precision')
        expect(observed).toContain('label')
        expect(observed).toContain('min')
        expect(observed).toContain('max')
    })


    test('change event should emit change event when value changes via stepper', () => {
        const handler = vi.fn()
        input.addEventListener('change', handler)

        const incrementBtn = input.shadowRoot.querySelectorAll('.number-input-stepper')[1]
        incrementBtn.click()

        expect(handler).toHaveBeenCalled()
        expect(handler.mock.calls[0][0].detail.value).toBeGreaterThan(0)
    })


    describe('setCompact', () => {

        test('adds compact attribute when true', () => {
            input.setCompact(true)
            expect(input.hasAttribute('compact')).toBe(true)
        })


        test('removes compact attribute when false', () => {
            input.setCompact(true)
            input.setCompact(false)
            expect(input.hasAttribute('compact')).toBe(false)
        })

    })


    describe('keyboard interaction', () => {

        test('ArrowUp increases value by step', () => {
            input.setStep(1)
            input.setValue(5)

            const handler = vi.fn()
            input.addEventListener('change', handler)

            const field = input.shadowRoot.querySelector('.number-input-field')
            field.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp'}))

            expect(input.value).toBe(6)
            expect(handler).toHaveBeenCalled()
        })


        test('ArrowDown decreases value by step', () => {
            input.setStep(1)
            input.setValue(5)

            const handler = vi.fn()
            input.addEventListener('change', handler)

            const field = input.shadowRoot.querySelector('.number-input-field')
            field.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}))

            expect(input.value).toBe(4)
            expect(handler).toHaveBeenCalled()
        })


        test('Shift multiplies step by 10', () => {
            input.setStep(1)
            input.setValue(5)

            const field = input.shadowRoot.querySelector('.number-input-field')
            field.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', shiftKey: true}))

            expect(input.value).toBe(15)
        })


        test('Ctrl multiplies step by 0.1', () => {
            input.setStep(1)
            input.setValue(5)

            const field = input.shadowRoot.querySelector('.number-input-field')
            field.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', ctrlKey: true}))

            expect(input.value).toBeCloseTo(5.1, 5)
        })

    })


    describe('stepper buttons', () => {

        test('decrement button decreases value', () => {
            input.setStep(1)
            input.setValue(10)

            const decrementBtn = input.shadowRoot.querySelectorAll('.number-input-stepper')[0]
            decrementBtn.click()

            expect(input.value).toBe(9)
        })


        test('increment button increases value', () => {
            input.setStep(1)
            input.setValue(10)

            const incrementBtn = input.shadowRoot.querySelectorAll('.number-input-stepper')[1]
            incrementBtn.click()

            expect(input.value).toBe(11)
        })

    })


    describe('display formatting', () => {

        test('displays value with configured precision', () => {
            input.setPrecision(3)
            input.setValue(1.5)

            const field = input.shadowRoot.querySelector('.number-input-field')
            expect(field.value).toBe('1.500')
        })


        test('updates display when precision changes', () => {
            input.setValue(1.5)
            input.setPrecision(1)

            const field = input.shadowRoot.querySelector('.number-input-field')
            expect(field.value).toBe('1.5')
        })

    })

})
