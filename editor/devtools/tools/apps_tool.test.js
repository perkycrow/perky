import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './apps_tool.js'


describe('AppsTool', () => {

    let tool
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        tool = document.createElement('apps-tool')
        container.appendChild(tool)
    })


    afterEach(() => {
        container.remove()
    })


    describe('static properties', () => {

        test('toolId', () => {
            expect(tool.constructor.toolId).toBe('apps')
        })


        test('toolName', () => {
            expect(tool.constructor.toolName).toBe('Applications')
        })


        test('toolIcon', () => {
            expect(tool.constructor.toolIcon).toBeDefined()
            expect(tool.constructor.toolIcon).toContain('<svg')
        })


        test('location', () => {
            expect(tool.constructor.location).toBe('sidebar')
        })


        test('order', () => {
            expect(tool.constructor.order).toBe(20)
        })

    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(tool).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(tool.shadowRoot).not.toBeNull()
        })


        test('creates container element', () => {
            const containerEl = tool.shadowRoot.querySelector('.apps-container')
            expect(containerEl).not.toBeNull()
        })


        test('creates registered apps section', () => {
            const section = tool.shadowRoot.querySelector('.apps-list[data-type="registered"]')
            expect(section).not.toBeNull()
        })


        test('creates running apps section', () => {
            const section = tool.shadowRoot.querySelector('.apps-list[data-type="running"]')
            expect(section).not.toBeNull()
        })

    })


    describe('onStateSet', () => {

        test('registers appmanager:change listener', () => {
            const state = {
                appManager: null,
                addEventListener: vi.fn()
            }

            tool.setState(state)

            expect(state.addEventListener).toHaveBeenCalledWith('appmanager:change', expect.any(Function))
        })

    })


    describe('without appManager', () => {

        test('shows no AppManager message in registered list', () => {
            const state = {
                appManager: null,
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const registeredList = tool.shadowRoot.querySelector('.apps-list[data-type="registered"]')
            expect(registeredList.innerHTML).toContain('No AppManager connected')
        })


        test('shows no AppManager message in running list', () => {
            const state = {
                appManager: null,
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const runningList = tool.shadowRoot.querySelector('.apps-list[data-type="running"]')
            expect(runningList.innerHTML).toContain('No AppManager connected')
        })

    })


    describe('with appManager', () => {

        test('shows no apps registered when empty', () => {
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => []
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const registeredList = tool.shadowRoot.querySelector('.apps-list[data-type="registered"]')
            expect(registeredList.innerHTML).toContain('No apps registered')
        })


        test('shows no apps running when empty', () => {
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => []
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const runningList = tool.shadowRoot.querySelector('.apps-list[data-type="running"]')
            expect(runningList.innerHTML).toContain('No apps running')
        })

    })


    describe('onActivate', () => {

        test('refreshes the tool', () => {
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => []
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            expect(() => tool.onActivate()).not.toThrow()
        })

    })

})
