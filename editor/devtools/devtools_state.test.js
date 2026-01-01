import {describe, test, expect, beforeEach, vi} from 'vitest'
import DevToolsState from './devtools_state.js'


describe('DevToolsState', () => {

    let state


    beforeEach(() => {
        state = new DevToolsState()
    })


    describe('initial state', () => {

        test('sidebarOpen is false', () => {
            expect(state.sidebarOpen).toBe(false)
        })


        test('activeTool is null', () => {
            expect(state.activeTool).toBe(null)
        })


        test('commandPaletteOpen is false', () => {
            expect(state.commandPaletteOpen).toBe(false)
        })


        test('loggerOpen is false', () => {
            expect(state.loggerOpen).toBe(false)
        })


        test('module is null', () => {
            expect(state.module).toBe(null)
        })


        test('appManager is null', () => {
            expect(state.appManager).toBe(null)
        })

    })


    describe('openTool', () => {

        test('sets activeTool and opens sidebar', () => {
            state.openTool('explorer')

            expect(state.activeTool).toBe('explorer')
            expect(state.sidebarOpen).toBe(true)
        })


        test('dispatches tool:change event', () => {
            const handler = vi.fn()
            state.addEventListener('tool:change', handler)

            state.openTool('explorer')

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {toolId: 'explorer', previousTool: null}
                })
            )
        })


        test('dispatches sidebar:open event', () => {
            const handler = vi.fn()
            state.addEventListener('sidebar:open', handler)

            state.openTool('explorer')

            expect(handler).toHaveBeenCalled()
        })


        test('does not dispatch tool:change if same tool', () => {
            state.openTool('explorer')

            const handler = vi.fn()
            state.addEventListener('tool:change', handler)

            state.openTool('explorer')

            expect(handler).not.toHaveBeenCalled()
        })

    })


    describe('closeSidebar', () => {

        test('closes sidebar', () => {
            state.openTool('explorer')
            state.closeSidebar()

            expect(state.sidebarOpen).toBe(false)
        })


        test('dispatches sidebar:close event', () => {
            state.openTool('explorer')

            const handler = vi.fn()
            state.addEventListener('sidebar:close', handler)

            state.closeSidebar()

            expect(handler).toHaveBeenCalled()
        })


        test('does nothing if already closed', () => {
            const handler = vi.fn()
            state.addEventListener('sidebar:close', handler)

            state.closeSidebar()

            expect(handler).not.toHaveBeenCalled()
        })

    })


    describe('toggleTool', () => {

        test('opens tool if sidebar closed', () => {
            state.toggleTool('explorer')

            expect(state.sidebarOpen).toBe(true)
            expect(state.activeTool).toBe('explorer')
        })


        test('closes sidebar if same tool is active', () => {
            state.openTool('explorer')
            state.toggleTool('explorer')

            expect(state.sidebarOpen).toBe(false)
        })


        test('switches tool if different tool', () => {
            state.openTool('explorer')
            state.toggleTool('apps')

            expect(state.sidebarOpen).toBe(true)
            expect(state.activeTool).toBe('apps')
        })

    })


    describe('commandPalette', () => {

        test('openCommandPalette opens command palette', () => {
            state.openCommandPalette()
            expect(state.commandPaletteOpen).toBe(true)
        })


        test('closeCommandPalette closes command palette', () => {
            state.openCommandPalette()
            state.closeCommandPalette()
            expect(state.commandPaletteOpen).toBe(false)
        })


        test('toggleCommandPalette toggles state', () => {
            state.toggleCommandPalette()
            expect(state.commandPaletteOpen).toBe(true)

            state.toggleCommandPalette()
            expect(state.commandPaletteOpen).toBe(false)
        })


        test('dispatches commandpalette:open event', () => {
            const handler = vi.fn()
            state.addEventListener('commandpalette:open', handler)

            state.openCommandPalette()

            expect(handler).toHaveBeenCalled()
        })


        test('dispatches commandpalette:close event', () => {
            state.openCommandPalette()

            const handler = vi.fn()
            state.addEventListener('commandpalette:close', handler)

            state.closeCommandPalette()

            expect(handler).toHaveBeenCalled()
        })

    })


    describe('logger', () => {

        test('openLogger opens logger', () => {
            state.openLogger()
            expect(state.loggerOpen).toBe(true)
        })


        test('closeLogger closes logger', () => {
            state.openLogger()
            state.closeLogger()
            expect(state.loggerOpen).toBe(false)
        })


        test('toggleLogger toggles state', () => {
            state.toggleLogger()
            expect(state.loggerOpen).toBe(true)

            state.toggleLogger()
            expect(state.loggerOpen).toBe(false)
        })


        test('dispatches logger:open event', () => {
            const handler = vi.fn()
            state.addEventListener('logger:open', handler)

            state.openLogger()

            expect(handler).toHaveBeenCalled()
        })


        test('dispatches logger:close event', () => {
            state.openLogger()

            const handler = vi.fn()
            state.addEventListener('logger:close', handler)

            state.closeLogger()

            expect(handler).toHaveBeenCalled()
        })

    })


    describe('setModule', () => {

        test('sets module', () => {
            const module = {id: 'test'}
            state.setModule(module)

            expect(state.module).toBe(module)
        })


        test('dispatches module:change event', () => {
            const module = {id: 'test'}
            const handler = vi.fn()
            state.addEventListener('module:change', handler)

            state.setModule(module)

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {module, previousModule: null}
                })
            )
        })

    })


    describe('setAppManager', () => {

        test('sets appManager', () => {
            const appManager = {id: 'test'}
            state.setAppManager(appManager)

            expect(state.appManager).toBe(appManager)
        })


        test('dispatches appmanager:change event', () => {
            const appManager = {id: 'test'}
            const handler = vi.fn()
            state.addEventListener('appmanager:change', handler)

            state.setAppManager(appManager)

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {appManager, previousAppManager: null}
                })
            )
        })

    })

})
