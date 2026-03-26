import {test, expect, vi, beforeEach} from 'vitest'
import StudioTool from './studio_tool.js'
import ActionController from '../core/action_controller.js'


class TestController extends ActionController {

    static bindings = {
        save: 'ctrl+s'
    }

    save () {
        this.engine.doSave()
    }
}


class TestTool extends StudioTool {

    static ActionController = TestController

    saved = false
    initCalled = false

    doSave () {
        this.saved = true
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


let tool


beforeEach(() => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    tool = new TestTool()
    tool.mount(container)
    tool.start()
})


test('constructor', () => {
    expect(tool.store).toBeDefined()
    expect(tool.history).toBeDefined()
    expect(tool.shadow).toBeDefined()
})


test('appLayout created', () => {
    expect(tool.appLayout).not.toBeNull()
})


test('init called on start', () => {
    tool.start()
    expect(tool.initCalled).toBe(true)
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


test('listActions', () => {
    expect(tool.listActions()).toEqual([])
})
