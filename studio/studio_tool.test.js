import {test, expect, vi, beforeEach, afterEach} from 'vitest'
import StudioTool from './studio_tool.js'


class TestTool extends StudioTool {

    static actions = {
        save: 'doSave',
        undo: 'doUndo'
    }

    static bindings = {
        save: 'ctrl+s',
        undo: 'ctrl+z'
    }

    saved = false
    undone = false
    initCalled = false

    doSave () {
        this.saved = true
    }

    doUndo () {
        this.undone = true
    }

    hasContext () {
        return true
    }

    init () {
        this.initCalled = true
    }

    autoSave () {
        this.saved = true
    }

    toolStyles () {  
        return []
    }
}

customElements.define('test-studio-tool', TestTool)


let tool
let container


beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    tool = document.createElement('test-studio-tool')
    container.appendChild(tool)
})


afterEach(() => {
    container.remove()
})


test('constructor', () => {
    expect(tool.store).toBeDefined()
    expect(tool.history).toBeDefined()
})


test('executeAction', () => {
    tool.executeAction('save')
    expect(tool.saved).toBe(true)
})


test('executeAction unknown', () => {
    const result = tool.executeAction('unknown')
    expect(result).toBe(false)
})


test('markDirty and autoSave', () => {
    vi.useFakeTimers()
    tool.saved = false
    tool.markDirty()
    vi.advanceTimersByTime(2000)
    expect(tool.saved).toBe(true)
    vi.useRealTimers()
})


test('flushSave', () => {
    tool.saved = false
    tool.markDirty()
    tool.flushSave()
    expect(tool.saved).toBe(true)
})


test('flushSave when not dirty', () => {
    tool.saved = false
    tool.flushSave()
    expect(tool.saved).toBe(false)
})


test('init called on connect when context ready', () => {
    expect(tool.initCalled).toBe(true)
})


test('appLayout created', () => {
    expect(tool.appLayout).not.toBeNull()
})


test('buildHeaderStart returns null by default', () => {
    expect(StudioTool.prototype.buildHeaderStart.call(tool)).toBeNull()
})


test('buildHeaderEnd returns null by default', () => {
    expect(StudioTool.prototype.buildHeaderEnd.call(tool)).toBeNull()
})


test('buildContent returns null by default', () => {
    expect(StudioTool.prototype.buildContent.call(tool)).toBeNull()
})


test('listActions', () => {
    const actions = tool.listActions()
    expect(actions).toContain('save')
    expect(actions).toContain('undo')
})


test('listActions returns empty when no actions defined', () => {
    class BareTool extends StudioTool {}
    customElements.define('bare-tool-actions', BareTool)
    const bareTool = document.createElement('bare-tool-actions')
    container.appendChild(bareTool)
    expect(bareTool.listActions()).toEqual([])
})


test('listBindings', () => {
    const bindings = tool.listBindings()
    expect(bindings.save).toBe('ctrl+s')
    expect(bindings.undo).toBe('ctrl+z')
})


test('listBindings returns empty when no bindings defined', () => {
    class BareTool extends StudioTool {}
    customElements.define('bare-tool-bindings', BareTool)
    const bareTool = document.createElement('bare-tool-bindings')
    container.appendChild(bareTool)
    expect(bareTool.listBindings()).toEqual({})
})


test('init not called when hasContext returns false', () => {
    class NoContextTool extends StudioTool {

        initCalled = false

        hasContext () {
            return false
        }

        init () {
            this.initCalled = true
        }
    }
    customElements.define('no-context-tool', NoContextTool)
    const noContextTool = document.createElement('no-context-tool')
    container.appendChild(noContextTool)
    expect(noContextTool.initCalled).toBe(false)
})


test('keyboard shortcut triggers action', () => {
    tool.saved = false
    const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true
    })
    window.dispatchEvent(event)
    expect(tool.saved).toBe(true)
})


test('keyboard shortcut with meta key triggers action', () => {
    tool.undone = false
    const event = new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        bubbles: true
    })
    window.dispatchEvent(event)
    expect(tool.undone).toBe(true)
})


test('keyboard shortcut without modifier does not trigger', () => {
    tool.saved = false
    const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: false,
        bubbles: true
    })
    window.dispatchEvent(event)
    expect(tool.saved).toBe(false)
})


test('keyboard shortcut with shift modifier', () => {
    class ShiftTool extends StudioTool {

        static actions = {redo: 'doRedo'}
        static bindings = {redo: 'ctrl+shift+z'}
        redone = false

        doRedo () {
            this.redone = true
        }
    }
    customElements.define('shift-tool', ShiftTool)
    const shiftTool = document.createElement('shift-tool')
    container.appendChild(shiftTool)

    const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true
    })
    window.dispatchEvent(event)
    expect(shiftTool.redone).toBe(true)
})


test('keyboard shortcut array binding', () => {
    class MultiBindTool extends StudioTool {

        static actions = {save: 'doSave'}
        static bindings = {save: ['ctrl+s', 'cmd+s']}
        saved = false

        doSave () {
            this.saved = true
        }
    }
    customElements.define('multi-bind-tool', MultiBindTool)
    const multiBind = document.createElement('multi-bind-tool')
    container.appendChild(multiBind)

    const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true
    })
    window.dispatchEvent(event)
    expect(multiBind.saved).toBe(true)
})


test('onDisconnected removes event listeners and flushes save', () => {
    vi.useFakeTimers()
    tool.saved = false
    tool.markDirty()

    container.removeChild(tool)

    expect(tool.saved).toBe(true)

    tool.saved = false
    const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true
    })
    window.dispatchEvent(event)
    expect(tool.saved).toBe(false)

    vi.useRealTimers()
})


test('onDisconnected clears pending autosave timer', () => {
    vi.useFakeTimers()
    tool.saved = false
    tool.markDirty()

    tool.saved = false
    container.removeChild(tool)

    expect(tool.saved).toBe(true)

    vi.advanceTimersByTime(2000)
    tool.saved = false
    expect(tool.saved).toBe(false)

    vi.useRealTimers()
})


test('hasContext returns false by default', () => {
    expect(StudioTool.prototype.hasContext.call(tool)).toBe(false)
})


test('toolStyles returns empty array by default', () => {
    expect(StudioTool.prototype.toolStyles.call(tool)).toEqual([])
})
