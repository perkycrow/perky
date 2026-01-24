import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './vec2_input.js'


describe('Vec2Input', () => {

    let vec2Input
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        vec2Input = document.createElement('vec2-input')
        container.appendChild(vec2Input)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(vec2Input).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(vec2Input.shadowRoot).not.toBeNull()
        })


        test('has null default value', () => {
            expect(vec2Input.value).toBeNull()
        })

    })


    test('value property gets and sets value', () => {
        const vec = {x: 10, y: 20}
        vec2Input.value = vec
        expect(vec2Input.value).toBe(vec)
    })


    test('setLabel sets label text', () => {
        vec2Input.setLabel('Position')
        const label = vec2Input.shadowRoot.querySelector('.vec2-input-label')
        expect(label.textContent).toBe('Position')
    })


    test('observedAttributes should include expected attributes', () => {
        const observed = vec2Input.constructor.observedAttributes
        expect(observed).toContain('label')
    })


    describe('sub-inputs', () => {

        test('should have x number input', () => {
            const inputs = vec2Input.shadowRoot.querySelectorAll('number-input')
            const xInput = Array.from(inputs).find(i => i.getAttribute('label') === 'x')
            expect(xInput).not.toBeNull()
        })


        test('should have y number input', () => {
            const inputs = vec2Input.shadowRoot.querySelectorAll('number-input')
            const yInput = Array.from(inputs).find(i => i.getAttribute('label') === 'y')
            expect(yInput).not.toBeNull()
        })


        test('should update x input when value set', () => {
            vec2Input.value = {x: 100, y: 200}
            const inputs = vec2Input.shadowRoot.querySelectorAll('number-input')
            const xInput = Array.from(inputs).find(i => i.getAttribute('label') === 'x')
            expect(xInput.value).toBe(100)
        })


        test('should update y input when value set', () => {
            vec2Input.value = {x: 100, y: 200}
            const inputs = vec2Input.shadowRoot.querySelectorAll('number-input')
            const yInput = Array.from(inputs).find(i => i.getAttribute('label') === 'y')
            expect(yInput.value).toBe(200)
        })

    })


    describe('change event', () => {

        test('should emit change event when x changes', () => {
            const vec = {x: 0, y: 0}
            vec2Input.value = vec

            const handler = vi.fn()
            vec2Input.addEventListener('change', handler)

            const inputs = vec2Input.shadowRoot.querySelectorAll('number-input')
            const xInput = Array.from(inputs).find(i => i.getAttribute('label') === 'x')
            xInput.dispatchEvent(new CustomEvent('change', {
                detail: {value: 50}
            }))

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.axis).toBe('x')
            expect(handler.mock.calls[0][0].detail.componentValue).toBe(50)
        })


        test('should emit change event when y changes', () => {
            const vec = {x: 0, y: 0}
            vec2Input.value = vec

            const handler = vi.fn()
            vec2Input.addEventListener('change', handler)

            const inputs = vec2Input.shadowRoot.querySelectorAll('number-input')
            const yInput = Array.from(inputs).find(i => i.getAttribute('label') === 'y')
            yInput.dispatchEvent(new CustomEvent('change', {
                detail: {value: 75}
            }))

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.axis).toBe('y')
            expect(handler.mock.calls[0][0].detail.componentValue).toBe(75)
        })


        test('should update vec2 object when sub-input changes', () => {
            const vec = {x: 0, y: 0}
            vec2Input.value = vec

            const inputs = vec2Input.shadowRoot.querySelectorAll('number-input')
            const xInput = Array.from(inputs).find(i => i.getAttribute('label') === 'x')
            xInput.dispatchEvent(new CustomEvent('change', {
                detail: {value: 123}
            }))

            expect(vec.x).toBe(123)
        })

    })

})
