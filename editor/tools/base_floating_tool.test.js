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

        test('extends HTMLElement', () => {
            expect(tool).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(tool.shadowRoot).not.toBeNull()
        })


        test('has static toolName', () => {
            expect(TestFloatingTool.toolName).toBe('Test Tool')
        })


        test('has default dimensions', () => {
            expect(BaseFloatingTool.defaultWidth).toBe(400)
            expect(BaseFloatingTool.defaultHeight).toBe(250)
        })


        test('is resizable by default', () => {
            expect(BaseFloatingTool.resizable).toBe(true)
        })

    })


    describe('params', () => {

        test('has empty params by default', () => {
            expect(tool.params).toEqual({})
        })


        test('sets params via setParams', () => {
            const params = {foo: 'bar', num: 42}
            tool.setParams(params)
            expect(tool.params).toEqual(params)
        })


        test('calls onParamsSet when params are set', () => {
            const onParamsSetSpy = vi.spyOn(tool, 'onParamsSet')
            const params = {key: 'value'}
            tool.setParams(params)
            expect(onParamsSetSpy).toHaveBeenCalledWith(params)
        })

    })


    describe('options', () => {

        test('has empty options by default', () => {
            expect(tool.options).toEqual({})
        })


        test('sets options via setOptions', () => {
            const options = {theme: 'dark', enabled: true}
            tool.setOptions(options)
            expect(tool.options).toEqual(options)
        })


        test('calls onOptionsSet when options are set', () => {
            const onOptionsSetSpy = vi.spyOn(tool, 'onOptionsSet')
            const options = {setting: 'value'}
            tool.setOptions(options)
            expect(onOptionsSetSpy).toHaveBeenCalledWith(options)
        })

    })


    describe('lifecycle hooks', () => {

        test('onParamsSet is callable', () => {
            expect(() => tool.onParamsSet()).not.toThrow()
        })


        test('onOptionsSet is callable', () => {
            expect(() => tool.onOptionsSet()).not.toThrow()
        })


        test('onOpen is callable', () => {
            expect(() => tool.onOpen()).not.toThrow()
        })


        test('onClose is callable', () => {
            expect(() => tool.onClose()).not.toThrow()
        })

    })


    describe('buildStyles', () => {

        test('returns a string', () => {
            const styles = BaseFloatingTool.buildStyles('.custom { color: red; }')
            expect(typeof styles).toBe('string')
        })


        test('includes custom styles', () => {
            const customStyle = '.my-class { display: flex; }'
            const styles = BaseFloatingTool.buildStyles(customStyle)
            expect(styles).toContain(customStyle)
        })

    })

})
