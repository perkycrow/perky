import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
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

        it('should extend HTMLElement', () => {
            expect(devtools).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(devtools.shadowRoot).not.toBeNull()
        })


        it('should create dock element', () => {
            const dock = devtools.shadowRoot.querySelector('devtools-dock')
            expect(dock).not.toBeNull()
        })


        it('should create sidebar element', () => {
            const sidebar = devtools.shadowRoot.querySelector('devtools-sidebar')
            expect(sidebar).not.toBeNull()
        })


        it('should create logger element', () => {
            const logger = devtools.shadowRoot.querySelector('perky-logger')
            expect(logger).not.toBeNull()
        })


        it('should have logger hidden by default', () => {
            const logger = devtools.shadowRoot.querySelector('perky-logger')
            expect(logger.classList.contains('hidden')).toBe(true)
        })

    })


    describe('state getter', () => {

        it('should return state object', () => {
            expect(devtools.state).toBeDefined()
            expect(devtools.state).not.toBeNull()
        })

    })


    describe('logger getter', () => {

        it('should return logger element', () => {
            const logger = devtools.logger
            expect(logger).not.toBeNull()
            expect(logger.tagName.toLowerCase()).toBe('perky-logger')
        })

    })


    describe('setModule', () => {

        it('should delegate to state', () => {
            const module = {name: 'test'}
            expect(() => devtools.setModule(module)).not.toThrow()
        })

    })


    describe('setAppManager', () => {

        it('should delegate to state', () => {
            const appManager = {list: () => []}
            expect(() => devtools.setAppManager(appManager)).not.toThrow()
        })

    })


    describe('openTool', () => {

        it('should delegate to state', () => {
            expect(() => devtools.openTool('explorer')).not.toThrow()
        })

    })


    describe('closeSidebar', () => {

        it('should delegate to state', () => {
            expect(() => devtools.closeSidebar()).not.toThrow()
        })

    })


    describe('toggleLogger', () => {

        it('should delegate to state', () => {
            expect(() => devtools.toggleLogger()).not.toThrow()
        })

    })


    describe('toggleCommandPalette', () => {

        it('should delegate to state', () => {
            vi.spyOn(devtools.state, 'toggleCommandPalette').mockImplementation(vi.fn())
            expect(() => devtools.toggleCommandPalette()).not.toThrow()
        })

    })


    describe('refreshTools', () => {

        it('should call refreshTools on dock', () => {
            expect(() => devtools.refreshTools()).not.toThrow()
        })

    })


    describe('keyboard shortcuts', () => {

        it('should toggle command palette on Ctrl+K', () => {
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


        it('should toggle command palette on Meta+K', () => {
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

        it('should clean up keyboard handler', () => {
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
