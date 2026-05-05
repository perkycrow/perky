import {test, expect} from 'vitest'
import PainterTool from './painter_tool.js'
import StudioTool from '../studio_tool.js'


test('PainterTool is registered as custom element', () => {
    expect(customElements.get('painter-tool')).toBe(PainterTool)
})


test('PainterTool extends StudioTool', () => {
    expect(PainterTool.prototype).toBeInstanceOf(StudioTool)
})


test('PainterTool declares actions and bindings', () => {
    expect(PainterTool.actions).toBeDefined()
    expect(PainterTool.bindings).toBeDefined()
    expect(PainterTool.actions.clear).toBe('handleClear')
})


test('PainterTool exposes lifecycle methods', () => {
    const proto = PainterTool.prototype
    expect(typeof proto.init).toBe('function')
    expect(typeof proto.buildContent).toBe('function')
    expect(typeof proto.autoSave).toBe('function')
    expect(typeof proto.setContext).toBe('function')
})


test('PainterTool hasContext returns true by default', () => {
    const tool = Object.create(PainterTool.prototype)
    expect(tool.hasContext()).toBe(true)
})
