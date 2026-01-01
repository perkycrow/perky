import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import BaseTool from './base_tool.js'


class TestTool extends BaseTool {
    static toolId = 'test'
    static toolName = 'Test Tool'
    static toolIcon = '🔧'
}

if (!customElements.get('test-tool')) {
    customElements.define('test-tool', TestTool)
}


describe('BaseTool', () => {

    let tool
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        tool = document.createElement('test-tool')
        container.appendChild(tool)
    })


    afterEach(() => {
        container.remove()
    })


    describe('static properties', () => {

        it('should have default toolId', () => {
            expect(BaseTool.toolId).toBe('base')
        })


        it('should have default toolName', () => {
            expect(BaseTool.toolName).toBe('Base Tool')
        })


        it('should have default toolIcon', () => {
            expect(BaseTool.toolIcon).toBe('🔧')
        })


        it('should have default location', () => {
            expect(BaseTool.location).toBe('sidebar')
        })


        it('should have default order', () => {
            expect(BaseTool.order).toBe(100)
        })

    })


    describe('initialization', () => {

        it('should extend HTMLElement', () => {
            expect(tool).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(tool.shadowRoot).not.toBeNull()
        })

    })


    describe('state getter', () => {

        it('should return null before setState', () => {
            expect(tool.state).toBeNull()
        })


        it('should return state after setState', () => {
            const state = {test: true}
            tool.setState(state)
            expect(tool.state).toBe(state)
        })

    })


    describe('setState', () => {

        it('should store state', () => {
            const state = {value: 42}
            tool.setState(state)
            expect(tool.state).toBe(state)
        })


        it('should call onStateSet', () => {
            const spy = vi.spyOn(tool, 'onStateSet')
            const state = {value: 42}
            tool.setState(state)
            expect(spy).toHaveBeenCalledWith(state)
        })

    })


    describe('onStateSet', () => {

        it('should be a no-op by default', () => {
            expect(() => tool.onStateSet({})).not.toThrow()
        })

    })


    describe('onActivate', () => {

        it('should be a no-op by default', () => {
            expect(() => tool.onActivate()).not.toThrow()
        })

    })


    describe('onDeactivate', () => {

        it('should be a no-op by default', () => {
            expect(() => tool.onDeactivate()).not.toThrow()
        })

    })


    describe('static register', () => {

        it('should be a function', () => {
            expect(typeof BaseTool.register).toBe('function')
        })

    })

})
