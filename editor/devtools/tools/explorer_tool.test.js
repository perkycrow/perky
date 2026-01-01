import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
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

        it('should have toolId', () => {
            expect(tool.constructor.toolId).toBe('explorer')
        })


        it('should have toolName', () => {
            expect(tool.constructor.toolName).toBe('Explorer')
        })


        it('should have toolIcon', () => {
            expect(tool.constructor.toolIcon).toBeDefined()
            expect(tool.constructor.toolIcon).toContain('<svg')
        })


        it('should have location set to sidebar', () => {
            expect(tool.constructor.location).toBe('sidebar')
        })


        it('should have order', () => {
            expect(tool.constructor.order).toBe(10)
        })

    })


    describe('initialization', () => {

        it('should extend HTMLElement', () => {
            expect(tool).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(tool.shadowRoot).not.toBeNull()
        })


        it('should create perky-explorer element', () => {
            const explorer = tool.shadowRoot.querySelector('perky-explorer')
            expect(explorer).not.toBeNull()
        })


        it('should set embedded attribute on explorer', () => {
            const explorer = tool.shadowRoot.querySelector('perky-explorer')
            expect(explorer.embedded).toBe(true)
        })

    })


    describe('onStateSet', () => {

        it('should register module:change listener', () => {
            const state = {
                module: null,
                addEventListener: vi.fn()
            }

            tool.setState(state)

            expect(state.addEventListener).toHaveBeenCalledWith('module:change', expect.any(Function))
        })


        it('should have explorer element when state has module', () => {
            const state = {
                module: null,
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const explorer = tool.shadowRoot.querySelector('perky-explorer')
            expect(explorer).not.toBeNull()
        })

    })


    describe('onActivate', () => {

        it('should not throw when state has no module', () => {
            const state = {
                module: null,
                addEventListener: vi.fn()
            }
            tool.setState(state)

            expect(() => tool.onActivate()).not.toThrow()
        })

    })

})
