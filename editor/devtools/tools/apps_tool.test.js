import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
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

        it('should have toolId', () => {
            expect(tool.constructor.toolId).toBe('apps')
        })


        it('should have toolName', () => {
            expect(tool.constructor.toolName).toBe('Applications')
        })


        it('should have toolIcon', () => {
            expect(tool.constructor.toolIcon).toBeDefined()
            expect(tool.constructor.toolIcon).toContain('<svg')
        })


        it('should have location set to sidebar', () => {
            expect(tool.constructor.location).toBe('sidebar')
        })


        it('should have order', () => {
            expect(tool.constructor.order).toBe(20)
        })

    })


    describe('initialization', () => {

        it('should extend HTMLElement', () => {
            expect(tool).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(tool.shadowRoot).not.toBeNull()
        })


        it('should create container element', () => {
            const containerEl = tool.shadowRoot.querySelector('.apps-container')
            expect(containerEl).not.toBeNull()
        })


        it('should create registered apps section', () => {
            const section = tool.shadowRoot.querySelector('.apps-list[data-type="registered"]')
            expect(section).not.toBeNull()
        })


        it('should create running apps section', () => {
            const section = tool.shadowRoot.querySelector('.apps-list[data-type="running"]')
            expect(section).not.toBeNull()
        })

    })


    describe('onStateSet', () => {

        it('should register appmanager:change listener', () => {
            const state = {
                appManager: null,
                addEventListener: vi.fn()
            }

            tool.setState(state)

            expect(state.addEventListener).toHaveBeenCalledWith('appmanager:change', expect.any(Function))
        })

    })


    describe('without appManager', () => {

        it('should show no AppManager message in registered list', () => {
            const state = {
                appManager: null,
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const registeredList = tool.shadowRoot.querySelector('.apps-list[data-type="registered"]')
            expect(registeredList.innerHTML).toContain('No AppManager connected')
        })


        it('should show no AppManager message in running list', () => {
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

        it('should show no apps registered when empty', () => {
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


        it('should show no apps running when empty', () => {
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

        it('should refresh the tool', () => {
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
