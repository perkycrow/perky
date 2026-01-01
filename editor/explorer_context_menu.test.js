import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import ExplorerContextMenu from './explorer_context_menu.js'


describe('ExplorerContextMenu', () => {

    let menu
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        menu = new ExplorerContextMenu()
        container.appendChild(menu)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('should be a custom element', () => {
            expect(menu).toBeInstanceOf(HTMLElement)
        })


        test('should have shadow DOM', () => {
            expect(menu.shadowRoot).not.toBeNull()
        })


        test('should be hidden by default', () => {
            expect(menu.style.display).toBe('none')
        })

    })


    describe('show', () => {

        test('should display the menu', () => {
            const actions = [{label: 'Test', icon: '🔍', action: vi.fn()}]

            menu.show(actions, {}, {x: 100, y: 100})

            expect(menu.style.display).toBe('block')
        })


        test('should render actions', () => {
            const actions = [
                {label: 'Action 1', icon: '🔍', action: vi.fn()},
                {label: 'Action 2', icon: '⚙', action: vi.fn()}
            ]

            menu.show(actions, {}, {x: 100, y: 100})

            const items = menu.shadowRoot.querySelectorAll('.context-menu-item')
            expect(items.length).toBe(2)
            expect(items[0].textContent).toContain('Action 1')
            expect(items[1].textContent).toContain('Action 2')
        })


        test('should render separators', () => {
            const actions = [
                {label: 'Action 1', icon: '🔍', action: vi.fn()},
                {separator: true},
                {label: 'Action 2', icon: '⚙', action: vi.fn()}
            ]

            menu.show(actions, {}, {x: 100, y: 100})

            const separators = menu.shadowRoot.querySelectorAll('.context-menu-separator')
            expect(separators.length).toBe(1)
        })


        test('should mark disabled actions', () => {
            const actions = [
                {label: 'Disabled', icon: '⚙', action: vi.fn(), disabled: true}
            ]

            menu.show(actions, {}, {x: 100, y: 100})

            const item = menu.shadowRoot.querySelector('.context-menu-item')
            expect(item.classList.contains('disabled')).toBe(true)
        })


        test('should mark danger actions', () => {
            const actions = [
                {label: 'Delete', icon: '🗑', action: vi.fn(), danger: true}
            ]

            menu.show(actions, {}, {x: 100, y: 100})

            const item = menu.shadowRoot.querySelector('.context-menu-item')
            expect(item.classList.contains('danger')).toBe(true)
        })

    })


    describe('action execution', () => {

        test('should call action when clicking item', () => {
            const actionFn = vi.fn()
            const module = {$id: 'test'}
            const actions = [{label: 'Test', icon: '🔍', action: actionFn}]

            menu.show(actions, module, {x: 100, y: 100})

            const item = menu.shadowRoot.querySelector('.context-menu-item')
            item.click()

            expect(actionFn).toHaveBeenCalledWith(module)
        })


        test('should hide menu after action is executed', () => {
            const actions = [{label: 'Test', icon: '🔍', action: vi.fn()}]

            menu.show(actions, {}, {x: 100, y: 100})

            const item = menu.shadowRoot.querySelector('.context-menu-item')
            item.click()

            expect(menu.style.display).toBe('none')
        })


        test('should not call action for disabled items', () => {
            const actionFn = vi.fn()
            const actions = [{label: 'Test', icon: '🔍', action: actionFn, disabled: true}]

            menu.show(actions, {}, {x: 100, y: 100})

            const item = menu.shadowRoot.querySelector('.context-menu-item')
            item.click()

            expect(actionFn).not.toHaveBeenCalled()
        })

    })


    describe('hide', () => {

        test('should hide the menu', () => {
            const actions = [{label: 'Test', icon: '🔍', action: vi.fn()}]

            menu.show(actions, {}, {x: 100, y: 100})
            menu.hide()

            expect(menu.style.display).toBe('none')
        })

    })


    describe('keyboard events', () => {

        test('should hide on Escape key', () => {
            const actions = [{label: 'Test', icon: '🔍', action: vi.fn()}]

            menu.show(actions, {}, {x: 100, y: 100})

            const event = new KeyboardEvent('keydown', {key: 'Escape'})
            document.dispatchEvent(event)

            expect(menu.style.display).toBe('none')
        })

    })

})
