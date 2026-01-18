import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import BaseTool from './base_tool.js'
import {ICONS} from '../devtools_icons.js'


class TestTool extends BaseTool {
    static toolId = 'test'
    static toolName = 'Test Tool'
    static toolIcon = ICONS.wrench
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

        test('toolId', () => {
            expect(BaseTool.toolId).toBe('base')
        })


        test('toolName', () => {
            expect(BaseTool.toolName).toBe('Base Tool')
        })


        test('location', () => {
            expect(BaseTool.location).toBe('sidebar')
        })


        test('order', () => {
            expect(BaseTool.order).toBe(100)
        })

    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(tool).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(tool.shadowRoot).not.toBeNull()
        })

    })


    describe('state getter', () => {

        test('returns null before setState', () => {
            expect(tool.state).toBeNull()
        })


        test('returns state after setState', () => {
            const state = {test: true}
            tool.setState(state)
            expect(tool.state).toBe(state)
        })

    })


    describe('setState', () => {

        test('stores state', () => {
            const state = {value: 42}
            tool.setState(state)
            expect(tool.state).toBe(state)
        })


        test('calls onStateSet', () => {
            const spy = vi.spyOn(tool, 'onStateSet')
            const state = {value: 42}
            tool.setState(state)
            expect(spy).toHaveBeenCalledWith(state)
        })

    })


    test('onStateSet is a no-op by default', () => {
        expect(() => tool.onStateSet({})).not.toThrow()
    })


    test('onActivate is a no-op by default', () => {
        expect(() => tool.onActivate()).not.toThrow()
    })


    test('onDeactivate is a no-op by default', () => {
        expect(() => tool.onDeactivate()).not.toThrow()
    })


    test('static register is a function', () => {
        expect(typeof BaseTool.register).toBe('function')
    })


    describe('getHeaderActions', () => {

        test('returns empty array by default', () => {
            expect(tool.getHeaderActions()).toEqual([])
        })


        test('returns an array', () => {
            expect(Array.isArray(tool.getHeaderActions())).toBe(true)
        })

    })

})
