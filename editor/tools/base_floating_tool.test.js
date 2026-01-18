import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import BaseFloatingTool from './base_floating_tool.js'
import {ICONS} from '../devtools/devtools_icons.js'


class TestFloatingTool extends BaseFloatingTool {
    static toolId = 'testTool'
    static toolName = 'Test Tool'
    static toolIcon = ICONS.flask
}
customElements.define('test-floating-tool', TestFloatingTool)


describe('BaseFloatingTool', () => {

    let tool
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        tool = document.createElement('test-floating-tool')
        container.appendChild(tool)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('should extend HTMLElement', () => {
            expect(tool).toBeInstanceOf(HTMLElement)
        })


        test('should have shadow DOM', () => {
            expect(tool.shadowRoot).not.toBeNull()
        })


        test('should have static toolId', () => {
            expect(TestFloatingTool.toolId).toBe('test-tool')
        })


        test('should have static toolName', () => {
            expect(TestFloatingTool.toolName).toBe('Test Tool')
        })


        test('should have static toolIcon', () => {
            expect(TestFloatingTool.toolIcon).toBe('🧪')
        })


        test('should have default dimensions', () => {
            expect(BaseFloatingTool.defaultWidth).toBe(400)
            expect(BaseFloatingTool.defaultHeight).toBe(250)
        })


        test('should be resizable by default', () => {
            expect(BaseFloatingTool.resizable).toBe(true)
        })

    })


    describe('params', () => {

        test('should have empty params by default', () => {
            expect(tool.params).toEqual({})
        })


        test('should set params via setParams', () => {
            const params = {foo: 'bar', num: 42}
            tool.setParams(params)
            expect(tool.params).toEqual(params)
        })


        test('should call onParamsSet when params are set', () => {
            const onParamsSetSpy = vi.spyOn(tool, 'onParamsSet')
            const params = {key: 'value'}
            tool.setParams(params)
            expect(onParamsSetSpy).toHaveBeenCalledWith(params)
        })

    })


    describe('lifecycle hooks', () => {

        test('onParamsSet should be callable', () => {
            expect(() => tool.onParamsSet()).not.toThrow()
        })


        test('onOpen should be callable', () => {
            expect(() => tool.onOpen()).not.toThrow()
        })


        test('onClose should be callable', () => {
            expect(() => tool.onClose()).not.toThrow()
        })

    })


    describe('buildStyles', () => {

        test('should return a string', () => {
            const styles = BaseFloatingTool.buildStyles('.custom { color: red; }')
            expect(typeof styles).toBe('string')
        })


        test('should include custom styles', () => {
            const customStyle = '.my-class { display: flex; }'
            const styles = BaseFloatingTool.buildStyles(customStyle)
            expect(styles).toContain(customStyle)
        })

    })

})
