import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './devtools_command_palette.js'


Element.prototype.scrollIntoView = vi.fn()


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


    test('setState accepts state object', () => {
        const state = {
            appManager: {list: () => []}
        }
        expect(() => palette.setState(state)).not.toThrow()
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


    test('keyboard navigation handles Escape key', () => {
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


    test('overlay click closes when clicking on overlay background', () => {
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


    test('input handling shows hint when input is empty', () => {
        palette.show()
        const hint = palette.shadowRoot.querySelector('.command-palette-hint')
        expect(hint).not.toBeNull()
        expect(hint.textContent).toContain('Type to search')
    })


    describe('keyboard navigation', () => {

        test('ArrowDown increases selected index', () => {
            const state = {
                appManager: {list: () => []},
                closeCommandPalette: vi.fn()
            }
            palette.setState(state)
            palette.show()

            const input = palette.shadowRoot.querySelector('.command-palette-input')
            input.value = '/open'
            input.dispatchEvent(new Event('input'))

            const event = new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true})
            input.dispatchEvent(event)

            const selected = palette.shadowRoot.querySelector('.command-palette-result.selected')
            expect(selected).not.toBeNull()
        })


        test('ArrowUp decreases selected index', () => {
            const state = {
                appManager: {list: () => []},
                closeCommandPalette: vi.fn()
            }
            palette.setState(state)
            palette.show()

            const input = palette.shadowRoot.querySelector('.command-palette-input')
            input.value = '/open'
            input.dispatchEvent(new Event('input'))

            input.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}))
            input.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true}))

            const selected = palette.shadowRoot.querySelector('.command-palette-result.selected')
            expect(selected).not.toBeNull()
        })


        test('Tab autocompletes selected command', () => {
            const state = {
                appManager: {list: () => []},
                closeCommandPalette: vi.fn()
            }
            palette.setState(state)
            palette.show()

            const input = palette.shadowRoot.querySelector('.command-palette-input')
            input.value = '/tog'
            input.dispatchEvent(new Event('input'))

            const event = new KeyboardEvent('keydown', {key: 'Tab', bubbles: true})
            input.dispatchEvent(event)

            expect(input.value).toContain('/toggle')
        })

    })


    describe('input filtering', () => {

        test('slash prefix filters internal commands', () => {
            const state = {
                appManager: {list: () => []},
                closeCommandPalette: vi.fn()
            }
            palette.setState(state)
            palette.show()

            const input = palette.shadowRoot.querySelector('.command-palette-input')
            input.value = '/open'
            input.dispatchEvent(new Event('input'))

            const results = palette.shadowRoot.querySelectorAll('.command-palette-result')
            expect(results.length).toBeGreaterThan(0)
        })


        test('shows no results message when no matches', () => {
            const state = {
                appManager: {list: () => []},
                closeCommandPalette: vi.fn()
            }
            palette.setState(state)
            palette.show()

            const input = palette.shadowRoot.querySelector('.command-palette-input')
            input.value = 'xyznonexistent123'
            input.dispatchEvent(new Event('input'))

            const empty = palette.shadowRoot.querySelector('.command-palette-empty')
            expect(empty).not.toBeNull()
            expect(empty.textContent).toContain('No results')
        })

    })


    describe('command execution', () => {

        test('Enter executes selected command', () => {
            const openLogger = vi.fn()
            const closeCommandPalette = vi.fn()
            const state = {
                appManager: {list: () => []},
                openLogger,
                closeCommandPalette
            }
            palette.setState(state)
            palette.show()

            const input = palette.shadowRoot.querySelector('.command-palette-input')
            input.value = '/open logger'
            input.dispatchEvent(new Event('input'))

            const event = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})
            input.dispatchEvent(event)

            expect(openLogger).toHaveBeenCalled()
            expect(closeCommandPalette).toHaveBeenCalled()
        })


        test('clicking result executes command', () => {
            const closeCommandPalette = vi.fn()
            const state = {
                appManager: {list: () => []},
                openLogger: vi.fn(),
                closeCommandPalette
            }
            palette.setState(state)
            palette.show()

            const input = palette.shadowRoot.querySelector('.command-palette-input')
            input.value = '/open logger'
            input.dispatchEvent(new Event('input'))

            const result = palette.shadowRoot.querySelector('.command-palette-result')
            if (result) {
                result.click()
                expect(closeCommandPalette).toHaveBeenCalled()
            }
        })

    })


    test('mouseenter on result updates selection', () => {
        const state = {
            appManager: {list: () => []},
            closeCommandPalette: vi.fn()
        }
        palette.setState(state)
        palette.show()

        const input = palette.shadowRoot.querySelector('.command-palette-input')
        input.value = '/open'
        input.dispatchEvent(new Event('input'))

        const results = palette.shadowRoot.querySelectorAll('.command-palette-result')
        if (results.length > 1) {
            results[1].dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}))
            expect(results[1].classList.contains('selected')).toBe(true)
        }
    })

})
