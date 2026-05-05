import {test, expect} from 'vitest'
import PainterView from './painter_view.js'


test('PainterView is registered as custom element', () => {
    expect(customElements.get('painter-view')).toBe(PainterView)
})


test('PainterView extends HTMLElement', () => {
    expect(PainterView.prototype).toBeInstanceOf(HTMLElement)
})


test('PainterView declares static styles', () => {
    expect(Array.isArray(PainterView.styles)).toBe(true)
    expect(PainterView.styles.length).toBeGreaterThan(0)
})


test('PainterView exposes public API methods', () => {
    const proto = PainterView.prototype
    expect(typeof proto.setBrush).toBe('function')
    expect(typeof proto.addLayer).toBe('function')
    expect(typeof proto.removeLayer).toBe('function')
    expect(typeof proto.clear).toBe('function')
})


test('PainterView lifecycle hooks are defined', () => {
    const proto = PainterView.prototype
    expect(typeof proto.onConnected).toBe('function')
    expect(typeof proto.onDisconnected).toBe('function')
})
