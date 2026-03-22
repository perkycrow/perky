import {describe, test, expect, vi, beforeEach, afterEach} from 'vitest'
import './flash.js'


let flashEl


beforeEach(() => {
    flashEl = document.createElement('editor-flash')
    document.body.appendChild(flashEl)
})


afterEach(() => {
    flashEl.remove()
})


describe('show', () => {

    test('adds flash item to shadow DOM', () => {
        flashEl.show('hello')

        const items = flashEl.shadowRoot.querySelectorAll('.flash-item')
        expect(items).toHaveLength(1)
        expect(items[0].textContent).toBe('hello')
    })


    test('applies type class', () => {
        flashEl.show('oops', 'error')

        const item = flashEl.shadowRoot.querySelector('.flash-item')
        expect(item.classList.contains('error')).toBe(true)
    })


    test('defaults to info type', () => {
        flashEl.show('note')

        const item = flashEl.shadowRoot.querySelector('.flash-item')
        expect(item.classList.contains('info')).toBe(true)
    })


    test('stacks multiple messages', () => {
        flashEl.show('first')
        flashEl.show('second')
        flashEl.show('third')

        const items = flashEl.shadowRoot.querySelectorAll('.flash-item')
        expect(items).toHaveLength(3)
    })


    test('auto-dismisses after timeout', () => {
        vi.useFakeTimers()

        flashEl.show('bye')

        vi.advanceTimersByTime(3000)

        const item = flashEl.shadowRoot.querySelector('.flash-item')
        expect(item.classList.contains('out')).toBe(true)

        vi.useRealTimers()
    })

})
