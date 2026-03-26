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
