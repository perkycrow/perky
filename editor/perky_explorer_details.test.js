import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
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

        test('extends HTMLElement', () => {
            expect(details).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(details.shadowRoot).not.toBeNull()
        })


        test('shows empty state when no module', () => {
            details.clear()
            const empty = details.shadowRoot.querySelector('.details-empty')
            expect(empty).not.toBeNull()
            expect(empty.textContent).toBe('Select a module to inspect')
        })

    })


    describe('setModule', () => {

        test('sets the module', () => {
            const module = createMockModule()
            details.setModule(module)
            expect(details.getModule()).toBe(module)
        })


        test('displays module id in title', () => {
            const module = createMockModule({$id: 'player'})
            details.setModule(module)

            const title = details.shadowRoot.querySelector('.details-title')
            expect(title.textContent).toContain('player')
        })


        test('displays status indicator', () => {
            const module = createMockModule({$status: 'started'})
            details.setModule(module)

            const status = details.shadowRoot.querySelector('.details-status')
            expect(status.classList.contains('started')).toBe(true)
        })

    })


    describe('getModule', () => {

        test('returns null when no module set', () => {
            expect(details.getModule()).toBeNull()
        })


        test('returns the set module', () => {
            const module = createMockModule()
            details.setModule(module)
            expect(details.getModule()).toBe(module)
        })

    })


    describe('clear', () => {

        test('clears the module', () => {
            const module = createMockModule()
            details.setModule(module)
            details.clear()
            expect(details.getModule()).toBeNull()
        })


        test('shows empty state after clear', () => {
            details.setModule(createMockModule())
            details.clear()

            const empty = details.shadowRoot.querySelector('.details-empty')
            expect(empty).not.toBeNull()
        })

    })


    test('focus:module event should emit focus:module event when focus button clicked', () => {
        const module = createMockModule()
        details.setModule(module)

        const handler = vi.fn()
        details.addEventListener('focus:module', handler)

        const focusBtn = details.shadowRoot.querySelector('.details-focus-btn')
        focusBtn.click()

        expect(handler).toHaveBeenCalled()
        expect(handler.mock.calls[0][0].detail.module).toBe(module)
    })


    test('registerInspector should be a static method', () => {
        expect(typeof PerkyExplorerDetails.registerInspector).toBe('function')
    })


    test('unregisterInspector should be a static method', () => {
        expect(typeof PerkyExplorerDetails.unregisterInspector).toBe('function')
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
