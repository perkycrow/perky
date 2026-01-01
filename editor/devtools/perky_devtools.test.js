import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './perky_devtools.js'


describe('PerkyDevTools', () => {

    let devtools
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        devtools = document.createElement('perky-devtools')
        container.appendChild(devtools)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(devtools).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(devtools.shadowRoot).not.toBeNull()
        })


        test('creates dock element', () => {
            const dock = devtools.shadowRoot.querySelector('devtools-dock')
            expect(dock).not.toBeNull()
        })


        test('creates sidebar element', () => {
            const sidebar = devtools.shadowRoot.querySelector('devtools-sidebar')
            expect(sidebar).not.toBeNull()
        })


        test('creates logger element', () => {
            const logger = devtools.shadowRoot.querySelector('perky-logger')
            expect(logger).not.toBeNull()
        })


        test('logger hidden by default', () => {
            const logger = devtools.shadowRoot.querySelector('perky-logger')
            expect(logger.classList.contains('hidden')).toBe(true)
        })

    })


    test('state getter returns state object', () => {
        expect(devtools.state).toBeDefined()
        expect(devtools.state).not.toBeNull()
    })


    test('logger getter returns logger element', () => {
        const logger = devtools.logger
        expect(logger).not.toBeNull()
        expect(logger.tagName.toLowerCase()).toBe('perky-logger')
    })


    test('setModule delegates to state', () => {
        const module = {name: 'test'}
        expect(() => devtools.setModule(module)).not.toThrow()
    })


    test('setAppManager delegates to state', () => {
        const appManager = {list: () => []}
        expect(() => devtools.setAppManager(appManager)).not.toThrow()
    })


    test('openTool delegates to state', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(() => devtools.openTool('explorer')).not.toThrow()
        console.warn.mockRestore()
    })


    test('closeSidebar delegates to state', () => {
        expect(() => devtools.closeSidebar()).not.toThrow()
    })


    test('toggleLogger delegates to state', () => {
        expect(() => devtools.toggleLogger()).not.toThrow()
    })


    test('toggleCommandPalette delegates to state', () => {
        vi.spyOn(devtools.state, 'toggleCommandPalette').mockImplementation(vi.fn())
        expect(() => devtools.toggleCommandPalette()).not.toThrow()
    })


    test('refreshTools calls refreshTools on dock', () => {
        expect(() => devtools.refreshTools()).not.toThrow()
    })


    describe('keyboard shortcuts', () => {

        test('toggles command palette on Ctrl+K', () => {
            const stub = vi.fn()
            vi.spyOn(devtools.state, 'toggleCommandPalette').mockImplementation(stub)

            const event = new KeyboardEvent('keydown', {
                key: 'k',
                ctrlKey: true,
                bubbles: true
            })
            document.dispatchEvent(event)

            expect(stub).toHaveBeenCalled()
        })


        test('toggles command palette on Meta+K', () => {
            const stub = vi.fn()
            vi.spyOn(devtools.state, 'toggleCommandPalette').mockImplementation(stub)

            const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true
            })
            document.dispatchEvent(event)

            expect(stub).toHaveBeenCalled()
        })

    })


    test('disconnectedCallback cleans up keyboard handler', () => {
        const stub = vi.fn()
        vi.spyOn(devtools.state, 'toggleCommandPalette').mockImplementation(stub)

        devtools.remove()

        const event = new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: true,
            bubbles: true
        })
        document.dispatchEvent(event)

        expect(stub).not.toHaveBeenCalled()
    })

})
