import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import './perky_explorer_details.js'
import PerkyExplorerDetails from './perky_explorer_details.js'


describe('PerkyExplorerDetails', () => {

    let details
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        details = document.createElement('perky-explorer-details')
        container.appendChild(details)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        it('should extend HTMLElement', () => {
            expect(details).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(details.shadowRoot).not.toBeNull()
        })


        it('should show empty state when no module', () => {
            details.clear()
            const empty = details.shadowRoot.querySelector('.details-empty')
            expect(empty).not.toBeNull()
            expect(empty.textContent).toBe('Select a module to inspect')
        })

    })


    describe('setModule', () => {

        it('should set the module', () => {
            const module = createMockModule()
            details.setModule(module)
            expect(details.getModule()).toBe(module)
        })


        it('should display module id in title', () => {
            const module = createMockModule({$id: 'player'})
            details.setModule(module)

            const title = details.shadowRoot.querySelector('.details-title')
            expect(title.textContent).toContain('player')
        })


        it('should display status indicator', () => {
            const module = createMockModule({$status: 'started'})
            details.setModule(module)

            const status = details.shadowRoot.querySelector('.details-status')
            expect(status.classList.contains('started')).toBe(true)
        })

    })


    describe('getModule', () => {

        it('should return null when no module set', () => {
            expect(details.getModule()).toBeNull()
        })


        it('should return the set module', () => {
            const module = createMockModule()
            details.setModule(module)
            expect(details.getModule()).toBe(module)
        })

    })


    describe('clear', () => {

        it('should clear the module', () => {
            const module = createMockModule()
            details.setModule(module)
            details.clear()
            expect(details.getModule()).toBeNull()
        })


        it('should show empty state after clear', () => {
            details.setModule(createMockModule())
            details.clear()

            const empty = details.shadowRoot.querySelector('.details-empty')
            expect(empty).not.toBeNull()
        })

    })


    describe('focus:module event', () => {

        it('should emit focus:module event when focus button clicked', () => {
            const module = createMockModule()
            details.setModule(module)

            const handler = vi.fn()
            details.addEventListener('focus:module', handler)

            const focusBtn = details.shadowRoot.querySelector('.details-focus-btn')
            focusBtn.click()

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.module).toBe(module)
        })

    })


    describe('registerInspector', () => {

        it('should be a static method', () => {
            expect(typeof PerkyExplorerDetails.registerInspector).toBe('function')
        })

    })


    describe('unregisterInspector', () => {

        it('should be a static method', () => {
            expect(typeof PerkyExplorerDetails.unregisterInspector).toBe('function')
        })

    })

})


function createMockModule (overrides = {}) {
    return {
        $id: 'test-module',
        $name: 'TestModule',
        $category: 'test',
        $status: 'stopped',
        $tags: [],
        children: [],
        ...overrides
    }
}
