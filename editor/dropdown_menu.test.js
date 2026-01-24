import {describe, test, expect, vi, beforeEach} from 'vitest'
import './dropdown_menu.js'


describe('DropdownMenu', () => {

    let menu

    beforeEach(() => {
        menu = document.createElement('dropdown-menu')
        document.body.appendChild(menu)
    })


    describe('constructor', () => {

        test('creates shadow root', () => {
            expect(menu.shadowRoot).not.toBeNull()
        })


        test('creates trigger button', () => {
            const trigger = menu.shadowRoot.querySelector('.trigger')
            expect(trigger).not.toBeNull()
        })


        test('creates menu container', () => {
            const menuEl = menu.shadowRoot.querySelector('.menu')
            expect(menuEl).not.toBeNull()
        })

    })


    test('setIcon sets trigger innerHTML', () => {
        menu.setIcon('<svg></svg>')
        const trigger = menu.shadowRoot.querySelector('.trigger')
        expect(trigger.innerHTML).toBe('<svg></svg>')
    })


    describe('setItems', () => {

        test('renders menu items', () => {
            menu.setItems([
                {label: 'Item 1', value: 'item1'},
                {label: 'Item 2', value: 'item2'}
            ])
            const items = menu.shadowRoot.querySelectorAll('.menu-item')
            expect(items.length).toBe(2)
        })


        test('sets item text content', () => {
            menu.setItems([{label: 'Test Item', value: 'test'}])
            const item = menu.shadowRoot.querySelector('.menu-item')
            expect(item.textContent).toBe('Test Item')
        })

    })


    describe('open/close/toggle', () => {

        test('open sets open attribute', () => {
            menu.open()
            expect(menu.hasAttribute('open')).toBe(true)
        })


        test('close removes open attribute', () => {
            menu.open()
            menu.close()
            expect(menu.hasAttribute('open')).toBe(false)
        })


        test('toggle opens when closed', () => {
            menu.toggle()
            expect(menu.hasAttribute('open')).toBe(true)
        })


        test('toggle closes when open', () => {
            menu.open()
            menu.toggle()
            expect(menu.hasAttribute('open')).toBe(false)
        })

    })


    test('trigger click toggles menu', () => {
        const trigger = menu.shadowRoot.querySelector('.trigger')
        trigger.click()
        expect(menu.hasAttribute('open')).toBe(true)
        trigger.click()
        expect(menu.hasAttribute('open')).toBe(false)
    })


    describe('item selection', () => {

        test('dispatches select event with value', () => {
            const handler = vi.fn()
            menu.addEventListener('select', handler)
            menu.setItems([{label: 'Test', value: 'test-value'}])
            menu.open()

            const item = menu.shadowRoot.querySelector('.menu-item')
            item.click()

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail).toEqual({value: 'test-value'})
        })


        test('uses label as value when value not provided', () => {
            const handler = vi.fn()
            menu.addEventListener('select', handler)
            menu.setItems([{label: 'Test Label'}])
            menu.open()

            const item = menu.shadowRoot.querySelector('.menu-item')
            item.click()

            expect(handler.mock.calls[0][0].detail).toEqual({value: 'Test Label'})
        })


        test('closes menu after selection', () => {
            menu.setItems([{label: 'Test', value: 'test'}])
            menu.open()

            const item = menu.shadowRoot.querySelector('.menu-item')
            item.click()

            expect(menu.hasAttribute('open')).toBe(false)
        })


        test('calls item action if provided', () => {
            const action = vi.fn()
            menu.setItems([{label: 'Test', value: 'test', action}])
            menu.open()

            const item = menu.shadowRoot.querySelector('.menu-item')
            item.click()

            expect(action).toHaveBeenCalled()
        })

    })


    describe('outside click', () => {

        test('closes menu on outside click', () => {
            menu.open()
            document.body.click()
            expect(menu.hasAttribute('open')).toBe(false)
        })


        test('does not close on click inside menu', () => {
            menu.setItems([{label: 'Test', value: 'test'}])
            menu.open()

            const trigger = menu.shadowRoot.querySelector('.trigger')
            trigger.click()

            expect(menu.hasAttribute('open')).toBe(false)
        })

    })


    test('removes outside click listener on disconnect', () => {
        const spy = vi.spyOn(document, 'removeEventListener')
        menu.disconnectedCallback()
        expect(spy).toHaveBeenCalledWith('click', expect.any(Function))
        spy.mockRestore()
    })

})
