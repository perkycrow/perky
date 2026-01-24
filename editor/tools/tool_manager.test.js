import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import ToolManager from './tool_manager.js'
import BaseFloatingTool from './base_floating_tool.js'
import {ICONS} from '../devtools/devtools_icons.js'
import logger from '../../core/logger.js'


class MockTool extends BaseFloatingTool {
    static toolId = 'mockTool'
    static toolName = 'Mock Tool'
    static toolIcon = ICONS.wrench
    static defaultWidth = 300
    static defaultHeight = 200
}
customElements.define('mock-tool', MockTool)


class AnotherMockTool extends BaseFloatingTool {
    static toolId = 'anotherTool'
    static toolName = 'Another Tool'
    static toolIcon = ICONS.tools
    static resizable = false
}
customElements.define('another-mock-tool', AnotherMockTool)


describe('ToolManager', () => {

    let manager
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)
        manager = new ToolManager(container)
    })


    afterEach(() => {
        manager.closeAll()
        container.remove()
    })


    describe('register', () => {

        test('registers a tool class', () => {
            manager.register(MockTool)
            expect(manager.has('mockTool')).toBe(true)
        })


        test('throws if tool has no toolId', () => {
            class InvalidTool extends BaseFloatingTool {
                static toolId = null
            }
            expect(() => manager.register(InvalidTool)).toThrow('Tool must have a static toolId')
        })

    })


    test('unregister unregisters a tool', () => {
        manager.register(MockTool)
        manager.unregister('mockTool')
        expect(manager.has('mockTool')).toBe(false)
    })


    describe('open', () => {

        test('returns null for unregistered tool', () => {
            const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {})
            const result = manager.open('nonexistent')
            expect(result).toBeNull()
            warnSpy.mockRestore()
        })


        test('opens a registered tool and returns instance id', () => {
            manager.register(MockTool)
            const instanceId = manager.open('mockTool')
            expect(instanceId).toMatch(/^mockTool-\d+$/)
        })


        test('appends tool window to container', () => {
            manager.register(MockTool)
            manager.open('mockTool')
            const window = container.querySelector('tool-window')
            expect(window).not.toBeNull()
        })


        test('passes params to tool', () => {
            manager.register(MockTool)
            const instanceId = manager.open('mockTool', {foo: 'bar'})
            const tool = manager.get(instanceId)
            expect(tool.params).toEqual({foo: 'bar'})
        })


        test('calls onOpen on the tool', () => {
            manager.register(MockTool)
            const onOpenSpy = vi.spyOn(MockTool.prototype, 'onOpen')
            manager.open('mockTool')
            expect(onOpenSpy).toHaveBeenCalled()
            onOpenSpy.mockRestore()
        })


        test('creates unique instance ids for multiple opens', () => {
            manager.register(MockTool)
            const id1 = manager.open('mockTool')
            const id2 = manager.open('mockTool')
            expect(id1).not.toBe(id2)
        })

    })


    describe('close', () => {

        test('closes an open tool', () => {
            manager.register(MockTool)
            const instanceId = manager.open('mockTool')
            manager.close(instanceId)
            expect(manager.isOpen(instanceId)).toBe(false)
        })


        test('calls onClose on the tool', () => {
            manager.register(MockTool)
            const onCloseSpy = vi.spyOn(MockTool.prototype, 'onClose')
            const instanceId = manager.open('mockTool')
            manager.close(instanceId)
            expect(onCloseSpy).toHaveBeenCalled()
            onCloseSpy.mockRestore()
        })


        test('does nothing for non-existent instance', () => {
            expect(() => manager.close('nonexistent-1')).not.toThrow()
        })

    })


    describe('closeAll', () => {

        test('closes all tool instances', () => {
            manager.register(MockTool)
            manager.register(AnotherMockTool)
            const id1 = manager.open('mockTool')
            const id2 = manager.open('anotherTool')
            manager.closeAll()
            expect(manager.isOpen(id1)).toBe(false)
            expect(manager.isOpen(id2)).toBe(false)
        })


        test('closes only instances of specified tool', () => {
            manager.register(MockTool)
            manager.register(AnotherMockTool)
            const mockId = manager.open('mockTool')
            const anotherId = manager.open('anotherTool')
            manager.closeAll('mockTool')
            expect(manager.isOpen(mockId)).toBe(false)
            expect(manager.isOpen(anotherId)).toBe(true)
        })

    })


    describe('get', () => {

        test('returns tool instance by id', () => {
            manager.register(MockTool)
            const instanceId = manager.open('mockTool')
            const tool = manager.get(instanceId)
            expect(tool).toBeInstanceOf(MockTool)
        })


        test('returns null for non-existent instance', () => {
            expect(manager.get('nonexistent-1')).toBeNull()
        })

    })


    describe('listTools', () => {

        test('returns empty array when no tools registered', () => {
            expect(manager.listTools()).toEqual([])
        })


        test('returns list of registered tools', () => {
            manager.register(MockTool)
            manager.register(AnotherMockTool)
            const tools = manager.listTools()
            expect(tools).toHaveLength(2)
            expect(tools.find(t => t.id === 'mockTool')).toBeDefined()
            expect(tools.find(t => t.id === 'anotherTool')).toBeDefined()
        })

    })


    describe('listInstances', () => {

        test('returns empty array when no instances open', () => {
            expect(manager.listInstances()).toEqual([])
        })


        test('returns list of open instance ids', () => {
            manager.register(MockTool)
            const id1 = manager.open('mockTool')
            const id2 = manager.open('mockTool')
            const instances = manager.listInstances()
            expect(instances).toContain(id1)
            expect(instances).toContain(id2)
        })

    })


    describe('has', () => {

        test('returns false for unregistered tool', () => {
            expect(manager.has('nonexistent')).toBe(false)
        })


        test('returns true for registered tool', () => {
            manager.register(MockTool)
            expect(manager.has('mockTool')).toBe(true)
        })

    })


    describe('isOpen', () => {

        test('returns false for non-existent instance', () => {
            expect(manager.isOpen('nonexistent-1')).toBe(false)
        })


        test('returns true for open instance', () => {
            manager.register(MockTool)
            const instanceId = manager.open('mockTool')
            expect(manager.isOpen(instanceId)).toBe(true)
        })

    })

})
