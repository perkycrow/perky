import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './devtools_command_palette.js'


describe('DevToolsCommandPalette', () => {

    let palette
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        palette = document.createElement('devtools-command-palette')
        container.appendChild(palette)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(palette).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(palette.shadowRoot).not.toBeNull()
        })


        test('creates overlay element', () => {
            const overlay = palette.shadowRoot.querySelector('.command-palette-overlay')
            expect(overlay).not.toBeNull()
        })


        test('creates input element', () => {
            const input = palette.shadowRoot.querySelector('.command-palette-input')
            expect(input).not.toBeNull()
        })


        test('creates results container', () => {
            const results = palette.shadowRoot.querySelector('.command-palette-results')
            expect(results).not.toBeNull()
        })


        test('hidden by default', () => {
            const overlay = palette.shadowRoot.querySelector('.command-palette-overlay')
            expect(overlay.classList.contains('hidden')).toBe(true)
        })

    })


    describe('setState', () => {

        test('accepts state object', () => {
            const state = {
                appManager: {list: () => []}
            }
            expect(() => palette.setState(state)).not.toThrow()
        })

    })


    describe('show', () => {

        test('removes hidden class from overlay', () => {
            palette.show()
            const overlay = palette.shadowRoot.querySelector('.command-palette-overlay')
            expect(overlay.classList.contains('hidden')).toBe(false)
        })


        test('clears input value', () => {
            const input = palette.shadowRoot.querySelector('.command-palette-input')
            input.value = 'test'
            palette.show()
            expect(input.value).toBe('')
        })

    })


    describe('hide', () => {

        test('adds hidden class to overlay', () => {
            palette.show()
            palette.hide()
            const overlay = palette.shadowRoot.querySelector('.command-palette-overlay')
            expect(overlay.classList.contains('hidden')).toBe(true)
        })


        test('clears input value', () => {
            const input = palette.shadowRoot.querySelector('.command-palette-input')
            palette.show()
            input.value = 'test'
            palette.hide()
            expect(input.value).toBe('')
        })

    })


    describe('keyboard navigation', () => {

        test('handles Escape key', () => {
            const state = {
                appManager: {list: () => []},
                closeCommandPalette: vi.fn()
            }
            palette.setState(state)
            palette.show()

            const input = palette.shadowRoot.querySelector('.command-palette-input')
            const event = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})
            input.dispatchEvent(event)

            expect(state.closeCommandPalette).toHaveBeenCalled()
        })

    })


    describe('overlay click', () => {

        test('closes when clicking on overlay background', () => {
            const state = {
                appManager: {list: () => []},
                closeCommandPalette: vi.fn()
            }
            palette.setState(state)
            palette.show()

            const overlay = palette.shadowRoot.querySelector('.command-palette-overlay')
            overlay.click()

            expect(state.closeCommandPalette).toHaveBeenCalled()
        })

    })


    describe('input handling', () => {

        test('shows hint when input is empty', () => {
            palette.show()
            const hint = palette.shadowRoot.querySelector('.command-palette-hint')
            expect(hint).not.toBeNull()
            expect(hint.textContent).toContain('Type to search')
        })

    })

})
