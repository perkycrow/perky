import {describe, test, expect, vi, beforeEach} from 'vitest'
import './select_input.js'


describe('SelectInput', () => {

    let select

    beforeEach(() => {
        select = document.createElement('select-input')
        document.body.appendChild(select)
    })


    describe('constructor', () => {

        test('creates shadow root', () => {
            expect(select.shadowRoot).not.toBeNull()
        })


        test('creates button element', () => {
            const button = select.shadowRoot.querySelector('.select-button')
            expect(button).not.toBeNull()
        })


        test('creates dropdown element', () => {
            const dropdown = select.shadowRoot.querySelector('.select-dropdown')
            expect(dropdown).not.toBeNull()
        })


        test('creates label element', () => {
            const label = select.shadowRoot.querySelector('.select-label')
            expect(label).not.toBeNull()
        })


        test('creates chevron element', () => {
            const chevron = select.shadowRoot.querySelector('.select-chevron')
            expect(chevron).not.toBeNull()
        })

    })


    describe('value property', () => {

        test('returns null initially', () => {
            expect(select.value).toBeNull()
        })


        test('setter updates value', () => {
            select.setOptions(['a', 'b', 'c'])
            select.value = 'b'
            expect(select.value).toBe('b')
        })


        test('does not update if same value', () => {
            select.setOptions(['a', 'b'])
            select.value = 'a'
            select.value = 'a'
            expect(select.value).toBe('a')
        })

    })


    describe('setValue', () => {

        test('sets the value', () => {
            select.setOptions(['x', 'y'])
            select.setValue('y')
            expect(select.value).toBe('y')
        })


        test('updates display', () => {
            select.setOptions([{value: 'test', label: 'Test Label'}])
            select.setValue('test')
            const label = select.shadowRoot.querySelector('.select-label')
            expect(label.textContent).toBe('Test Label')
        })

    })


    describe('setOptions', () => {

        test('accepts string array', () => {
            select.setOptions(['Option 1', 'Option 2'])
            const options = select.shadowRoot.querySelectorAll('.select-option')
            expect(options.length).toBe(2)
        })


        test('converts strings to value/label objects', () => {
            select.setOptions(['Test'])
            const option = select.shadowRoot.querySelector('.select-option')
            expect(option.textContent).toBe('Test')
        })


        test('accepts object array', () => {
            select.setOptions([
                {value: 'a', label: 'Label A'},
                {value: 'b', label: 'Label B'}
            ])
            const options = select.shadowRoot.querySelectorAll('.select-option')
            expect(options.length).toBe(2)
            expect(options[0].textContent).toBe('Label A')
        })


        test('renders options in dropdown', () => {
            select.setOptions(['One', 'Two', 'Three'])
            const options = select.shadowRoot.querySelectorAll('.select-option')
            expect(options.length).toBe(3)
        })

    })


    describe('click behavior', () => {

        test('clicking button opens dropdown', () => {
            select.setOptions(['a', 'b'])
            const button = select.shadowRoot.querySelector('.select-button')
            button.click()

            expect(button.classList.contains('open')).toBe(true)
            const dropdown = select.shadowRoot.querySelector('.select-dropdown')
            expect(dropdown.classList.contains('open')).toBe(true)
        })


        test('clicking button again closes dropdown', () => {
            select.setOptions(['a', 'b'])
            const button = select.shadowRoot.querySelector('.select-button')
            button.click()
            button.click()

            expect(button.classList.contains('open')).toBe(false)
        })

    })


    describe('option selection', () => {

        test('clicking option selects it', () => {
            select.setOptions(['a', 'b', 'c'])
            const button = select.shadowRoot.querySelector('.select-button')
            button.click()

            const options = select.shadowRoot.querySelectorAll('.select-option')
            options[1].click()

            expect(select.value).toBe('b')
        })


        test('closes dropdown after selection', () => {
            select.setOptions(['a', 'b'])
            const button = select.shadowRoot.querySelector('.select-button')
            button.click()

            const option = select.shadowRoot.querySelector('.select-option')
            option.click()

            expect(button.classList.contains('open')).toBe(false)
        })


        test('dispatches change event on selection', () => {
            const handler = vi.fn()
            select.addEventListener('change', handler)
            select.setOptions(['x', 'y'])

            const button = select.shadowRoot.querySelector('.select-button')
            button.click()

            const options = select.shadowRoot.querySelectorAll('.select-option')
            options[1].click()

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail).toEqual({value: 'y'})
        })


        test('does not dispatch change if same value selected', () => {
            const handler = vi.fn()
            select.setOptions(['a', 'b'])
            select.setValue('a')
            select.addEventListener('change', handler)

            const button = select.shadowRoot.querySelector('.select-button')
            button.click()

            const options = select.shadowRoot.querySelectorAll('.select-option')
            options[0].click()

            expect(handler).not.toHaveBeenCalled()
        })


        test('updates label after selection', () => {
            select.setOptions([{value: 'v1', label: 'First'}, {value: 'v2', label: 'Second'}])
            const button = select.shadowRoot.querySelector('.select-button')
            button.click()

            const options = select.shadowRoot.querySelectorAll('.select-option')
            options[1].click()

            const label = select.shadowRoot.querySelector('.select-label')
            expect(label.textContent).toBe('Second')
        })


        test('marks selected option with class', () => {
            select.setOptions(['a', 'b', 'c'])
            select.setValue('b')

            const options = select.shadowRoot.querySelectorAll('.select-option')
            expect(options[1].classList.contains('selected')).toBe(true)
            expect(options[0].classList.contains('selected')).toBe(false)
        })

    })


    describe('keyboard navigation', () => {

        test('Enter opens dropdown when closed', () => {
            select.setOptions(['a', 'b'])
            const button = select.shadowRoot.querySelector('.select-button')
            button.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}))

            expect(button.classList.contains('open')).toBe(true)
        })


        test('Space opens dropdown when closed', () => {
            select.setOptions(['a', 'b'])
            const button = select.shadowRoot.querySelector('.select-button')
            button.dispatchEvent(new KeyboardEvent('keydown', {key: ' '}))

            expect(button.classList.contains('open')).toBe(true)
        })


        test('ArrowDown opens dropdown when closed', () => {
            select.setOptions(['a', 'b'])
            const button = select.shadowRoot.querySelector('.select-button')
            button.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}))

            expect(button.classList.contains('open')).toBe(true)
        })


        test('Escape closes dropdown', () => {
            select.setOptions(['a', 'b'])
            const button = select.shadowRoot.querySelector('.select-button')
            button.click()
            button.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))

            expect(button.classList.contains('open')).toBe(false)
        })

    })


    test('disconnectedCallback closes dropdown', () => {
        select.setOptions(['a', 'b'])
        const button = select.shadowRoot.querySelector('.select-button')
        button.click()

        select.disconnectedCallback()

        expect(button.classList.contains('open')).toBe(false)
    })

})
