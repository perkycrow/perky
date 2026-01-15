import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './explorer_tool.js'


describe('ExplorerTool', () => {

    let tool
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        tool = document.createElement('explorer-tool')
        container.appendChild(tool)
    })


    afterEach(() => {
        container.remove()
    })


    describe('static properties', () => {

        test('toolId', () => {
            expect(tool.constructor.toolId).toBe('explorer')
        })


        test('toolName', () => {
            expect(tool.constructor.toolName).toBe('Explorer')
        })


        test('toolIcon', () => {
            expect(tool.constructor.toolIcon).toBeDefined()
            expect(tool.constructor.toolIcon).toContain('<svg')
        })


        test('location', () => {
            expect(tool.constructor.location).toBe('sidebar')
        })


        test('order', () => {
            expect(tool.constructor.order).toBe(10)
        })

    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(tool).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(tool.shadowRoot).not.toBeNull()
        })


        test('creates perky-explorer element', () => {
            const explorer = tool.shadowRoot.querySelector('perky-explorer')
            expect(explorer).not.toBeNull()
        })


        test('sets embedded attribute on explorer', () => {
            const explorer = tool.shadowRoot.querySelector('perky-explorer')
            expect(explorer.embedded).toBe(true)
        })

    })


    describe('onStateSet', () => {

        test('registers module:change listener', () => {
            const state = {
                module: null,
                addEventListener: vi.fn()
            }

            tool.setState(state)

            expect(state.addEventListener).toHaveBeenCalledWith('module:change', expect.any(Function))
        })


        test('has explorer element when state has module', () => {
            const state = {
                module: null,
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const explorer = tool.shadowRoot.querySelector('perky-explorer')
            expect(explorer).not.toBeNull()
        })

    })


    test('onActivate does not throw when state has no module', () => {
        const state = {
            module: null,
            addEventListener: vi.fn()
        }
        tool.setState(state)

        expect(() => tool.onActivate()).not.toThrow()
    })


    describe('getHeaderActions', () => {

        test('returns an array with one action', () => {
            const actions = tool.getHeaderActions()

            expect(Array.isArray(actions)).toBe(true)
            expect(actions.length).toBe(1)
        })


        test('action has required properties', () => {
            const actions = tool.getHeaderActions()
            const action = actions[0]

            expect(action).toHaveProperty('icon')
            expect(action).toHaveProperty('title')
            expect(action).toHaveProperty('active')
            expect(action).toHaveProperty('onClick')
        })


        test('action title reflects showSystemModules state', () => {
            const explorer = tool.shadowRoot.querySelector('perky-explorer')
            explorer.showSystemModules = false

            const actions = tool.getHeaderActions()

            expect(actions[0].title).toBe('Show system modules')
        })


        test('action active reflects showSystemModules state', () => {
            const explorer = tool.shadowRoot.querySelector('perky-explorer')
            explorer.showSystemModules = false

            const actions = tool.getHeaderActions()

            expect(actions[0].active).toBe(false)
        })


        test('onClick toggles showSystemModules', () => {
            const explorer = tool.shadowRoot.querySelector('perky-explorer')
            explorer.showSystemModules = false

            const actions = tool.getHeaderActions()
            actions[0].onClick()

            expect(explorer.showSystemModules).toBe(true)
        })

    })

})
