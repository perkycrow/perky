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


    describe('state getter', () => {

        test('returns state object', () => {
            expect(devtools.state).toBeDefined()
            expect(devtools.state).not.toBeNull()
        })

    })


    describe('logger getter', () => {

        test('returns logger element', () => {
            const logger = devtools.logger
            expect(logger).not.toBeNull()
            expect(logger.tagName.toLowerCase()).toBe('perky-logger')
        })

    })


    describe('setModule', () => {

        test('delegates to state', () => {
            const module = {name: 'test'}
            expect(() => devtools.setModule(module)).not.toThrow()
        })

    })


    describe('setAppManager', () => {

        test('delegates to state', () => {
            const appManager = {list: () => []}
            expect(() => devtools.setAppManager(appManager)).not.toThrow()
        })

    })


    describe('openTool', () => {

        test('delegates to state', () => {
            expect(() => devtools.openTool('explorer')).not.toThrow()
        })

    })


    describe('closeSidebar', () => {

        test('delegates to state', () => {
            expect(() => devtools.closeSidebar()).not.toThrow()
        })

    })


    describe('toggleLogger', () => {

        test('delegates to state', () => {
            expect(() => devtools.toggleLogger()).not.toThrow()
        })

    })


    describe('toggleCommandPalette', () => {

        test('delegates to state', () => {
            vi.spyOn(devtools.state, 'toggleCommandPalette').mockImplementation(vi.fn())
            expect(() => devtools.toggleCommandPalette()).not.toThrow()
        })

    })


    describe('refreshTools', () => {

        test('calls refreshTools on dock', () => {
            expect(() => devtools.refreshTools()).not.toThrow()
        })

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


    describe('disconnectedCallback', () => {

        test('cleans up keyboard handler', () => {
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

})
