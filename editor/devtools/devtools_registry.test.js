import {describe, test, expect, beforeEach} from 'vitest'
import {
    registerTool,
    unregisterTool,
    getTool,
    getAllTools,
    getToolsByLocation,
    getSidebarTools,
    getBottomTools
} from './devtools_registry.js'
import {ICONS} from './devtools_icons.js'


class MockTool {
    static toolId = 'mock'
    static toolName = 'Mock Tool'
    static toolIcon = ICONS.wrench
    static location = 'sidebar'
    static order = 50
}


class MockTool2 {
    static toolId = 'mock2'
    static toolName = 'Mock Tool 2'
    static toolIcon = ICONS.hammer
    static location = 'sidebar'
    static order = 10
}


class MockBottomTool {
    static toolId = 'mockBottom'
    static toolName = 'Mock Bottom'
    static toolIcon = ICONS.clipboard
    static location = 'bottom'
    static order = 100
}


describe('DevToolsRegistry', () => {

    beforeEach(() => {
        unregisterTool('mock')
        unregisterTool('mock2')
        unregisterTool('mockBottom')
    })


    test('registerTool adds tool to registry', () => {
        registerTool(MockTool)
        expect(getTool('mock')).toBe(MockTool)
    })


    test('registerTool throws if no toolId', () => {
        class NoIdTool {}
        expect(() => registerTool(NoIdTool)).toThrow('Tool must have a static toolId property')
    })


    test('unregisterTool removes tool from registry', () => {
        registerTool(MockTool)
        unregisterTool('mock')
        expect(getTool('mock')).toBeUndefined()
    })


    test('getAllTools returns all registered tools', () => {
        registerTool(MockTool)
        registerTool(MockTool2)

        const tools = getAllTools()
        expect(tools).toContain(MockTool)
        expect(tools).toContain(MockTool2)
    })


    test('getToolsByLocation filters by location', () => {
        registerTool(MockTool)
        registerTool(MockBottomTool)

        const sidebarTools = getToolsByLocation('sidebar')
        const bottomTools = getToolsByLocation('bottom')

        expect(sidebarTools).toContain(MockTool)
        expect(sidebarTools).not.toContain(MockBottomTool)
        expect(bottomTools).toContain(MockBottomTool)
        expect(bottomTools).not.toContain(MockTool)
    })


    test('getToolsByLocation sorts by order', () => {
        registerTool(MockTool)
        registerTool(MockTool2)

        const tools = getToolsByLocation('sidebar')
        expect(tools[0]).toBe(MockTool2)
        expect(tools[1]).toBe(MockTool)
    })


    test('getSidebarTools returns sidebar tools', () => {
        registerTool(MockTool)
        registerTool(MockBottomTool)

        const tools = getSidebarTools()
        expect(tools).toContain(MockTool)
        expect(tools).not.toContain(MockBottomTool)
    })


    test('getBottomTools returns bottom tools', () => {
        registerTool(MockTool)
        registerTool(MockBottomTool)

        const tools = getBottomTools()
        expect(tools).toContain(MockBottomTool)
        expect(tools).not.toContain(MockTool)
    })

})
