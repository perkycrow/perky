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
    expect(input.step).toBe('0.5')

    const label = panel.shadowRoot.querySelector('.prop-label')
    expect(label.textContent).toBe('x')
})


test('addNumber calls onChange on input change', () => {
    const onChange = vi.fn()
    panel.addNumber('x', 5, onChange)

    const input = panel.shadowRoot.querySelector('.prop-input')
    input.value = '10'
    input.dispatchEvent(new Event('change'))

    expect(onChange).toHaveBeenCalledWith(10)
})


test('addNumber respects custom step option', () => {
    panel.addNumber('x', 5, vi.fn(), {step: 0.1})

    const input = panel.shadowRoot.querySelector('.prop-input')
    expect(input.step).toBe('0.1')
})


test('addNumber handles invalid input', () => {
    const onChange = vi.fn()
    panel.addNumber('x', 5, onChange)

    const input = panel.shadowRoot.querySelector('.prop-input')
    input.value = 'invalid'
    input.dispatchEvent(new Event('change'))

    expect(onChange).toHaveBeenCalledWith(0)
})


test('addText', () => {
    const onChange = vi.fn()
    panel.addText('name', 'Alice', onChange)

    const input = panel.shadowRoot.querySelector('.prop-input')
    expect(input.value).toBe('Alice')
    expect(input.type).toBe('text')

    const label = panel.shadowRoot.querySelector('.prop-label')
    expect(label.textContent).toBe('name')
})


test('addText calls onChange on input change', () => {
    const onChange = vi.fn()
    panel.addText('name', 'Alice', onChange)

    const input = panel.shadowRoot.querySelector('.prop-input')
    input.value = 'Bob'
    input.dispatchEvent(new Event('change'))

    expect(onChange).toHaveBeenCalledWith('Bob')
})


test('addText handles empty value', () => {
    panel.addText('name', null, vi.fn())

    const input = panel.shadowRoot.querySelector('.prop-input')
    expect(input.value).toBe('')
})


test('addButton', () => {
    const onClick = vi.fn()
    panel.addButton('Delete', onClick, 'danger')

    const btn = panel.shadowRoot.querySelector('.panel-btn.danger')
    expect(btn.textContent).toBe('Delete')
})


test('addButton calls onClick when clicked', () => {
    const onClick = vi.fn()
    panel.addButton('Save', onClick)

    const btn = panel.shadowRoot.querySelector('.panel-btn')
    btn.click()

    expect(onClick).toHaveBeenCalled()
})


test('addButton without variant', () => {
    panel.addButton('Save', vi.fn())

    const btn = panel.shadowRoot.querySelector('.panel-btn')
    expect(btn.className).toBe('panel-btn')
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
