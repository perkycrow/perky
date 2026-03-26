import {test, expect, vi, beforeEach, afterEach} from 'vitest'
import './properties_panel.js'


let panel
let container


beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    panel = document.createElement('properties-panel')
    container.appendChild(panel)
})


afterEach(() => {
    container.remove()
})


test('creates panel element', () => {
    expect(panel.shadowRoot).not.toBeNull()
})


test('addTitle', () => {
    panel.addTitle('Properties')
    const title = panel.shadowRoot.querySelector('.panel-title')
    expect(title.textContent).toBe('Properties')
})


test('addNumber', () => {
    const onChange = vi.fn()
    panel.addNumber('x', 5, onChange)

    const input = panel.shadowRoot.querySelector('.prop-input')
    expect(input.value).toBe('5')
})


test('addButton', () => {
    const onClick = vi.fn()
    panel.addButton('Delete', onClick, 'danger')

    const btn = panel.shadowRoot.querySelector('.panel-btn.danger')
    expect(btn.textContent).toBe('Delete')
})


test('addMessage', () => {
    panel.addMessage('Select an entity')
    const msg = panel.shadowRoot.querySelector('.empty-message')
    expect(msg.textContent).toBe('Select an entity')
})


test('clear', () => {
    panel.addTitle('Test')
    panel.clear()
    const title = panel.shadowRoot.querySelector('.panel-title')
    expect(title).toBeNull()
})


test('addSeparator', () => {
    panel.addSeparator()
    const sep = panel.shadowRoot.querySelector('.panel-separator')
    expect(sep).not.toBeNull()
})
