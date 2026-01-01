import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './devtools_dock.js'


describe('DevToolsDock', () => {

    let dock
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        dock = document.createElement('devtools-dock')
        container.appendChild(dock)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(dock).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(dock.shadowRoot).not.toBeNull()
        })


        test('creates dock element', () => {
            const dockEl = dock.shadowRoot.querySelector('.devtools-dock')
            expect(dockEl).not.toBeNull()
        })


        test('starts minimized', () => {
            const dockEl = dock.shadowRoot.querySelector('.devtools-dock')
            expect(dockEl.classList.contains('minimized')).toBe(true)
        })

    })


    describe('setState', () => {

        test('accepts state object', () => {
            const state = {
                addEventListener: vi.fn()
            }
            expect(() => dock.setState(state)).not.toThrow()
        })


        test('registers event listeners on state', () => {
            const state = {
                addEventListener: vi.fn()
            }
            dock.setState(state)

            expect(state.addEventListener).toHaveBeenCalledWith('tool:change', expect.any(Function))
            expect(state.addEventListener).toHaveBeenCalledWith('sidebar:open', expect.any(Function))
            expect(state.addEventListener).toHaveBeenCalledWith('sidebar:close', expect.any(Function))
            expect(state.addEventListener).toHaveBeenCalledWith('logger:open', expect.any(Function))
            expect(state.addEventListener).toHaveBeenCalledWith('logger:close', expect.any(Function))
        })

    })


    describe('minimized state', () => {

        test('shows crow button when minimized', () => {
            const buttons = dock.shadowRoot.querySelectorAll('.dock-button')
            expect(buttons.length).toBe(1)
        })


        test('expands when crow button is clicked', () => {
            const state = {
                addEventListener: vi.fn(),
                toggleTool: vi.fn(),
                sidebarOpen: false,
                toggleSidebar: vi.fn()
            }
            dock.setState(state)

            const crowBtn = dock.shadowRoot.querySelector('.dock-button')
            crowBtn.click()

            const dockEl = dock.shadowRoot.querySelector('.devtools-dock')
            expect(dockEl.classList.contains('minimized')).toBe(false)
        })

    })


    describe('expanded state', () => {

        beforeEach(() => {
            const state = {
                addEventListener: vi.fn(),
                toggleTool: vi.fn(),
                sidebarOpen: false,
                toggleSidebar: vi.fn()
            }
            dock.setState(state)

            const crowBtn = dock.shadowRoot.querySelector('.dock-button')
            crowBtn.click()
        })


        test('shows multiple buttons when expanded', () => {
            const buttons = dock.shadowRoot.querySelectorAll('.dock-button')
            expect(buttons.length).toBeGreaterThan(1)
        })


        test('shows separators', () => {
            const separators = dock.shadowRoot.querySelectorAll('.dock-separator')
            expect(separators.length).toBeGreaterThan(0)
        })

    })


    test('refreshTools re-renders the dock', () => {
        const state = {
            addEventListener: vi.fn(),
            toggleTool: vi.fn(),
            sidebarOpen: false,
            toggleSidebar: vi.fn()
        }
        dock.setState(state)

        expect(() => dock.refreshTools()).not.toThrow()
    })

})
