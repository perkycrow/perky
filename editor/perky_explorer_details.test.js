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


    describe('default grid rendering', () => {

        test('displays $name in grid', () => {
            details.setModule(createMockModule({$name: 'Player'}))

            const content = details.shadowRoot.querySelector('.details-content')
            expect(content.textContent).toContain('$name')
            expect(content.textContent).toContain('Player')
        })


        test('displays $category in grid', () => {
            details.setModule(createMockModule({$category: 'game'}))

            const content = details.shadowRoot.querySelector('.details-content')
            expect(content.textContent).toContain('$category')
            expect(content.textContent).toContain('game')
        })


        test('displays $tags when present', () => {
            details.setModule(createMockModule({$tags: ['enemy', 'boss']}))

            const content = details.shadowRoot.querySelector('.details-content')
            expect(content.textContent).toContain('$tags')
            expect(content.textContent).toContain('enemy')
            expect(content.textContent).toContain('boss')
        })


        test('displays children count', () => {
            const children = [
                createMockModule({$id: 'child1'}),
                createMockModule({$id: 'child2'})
            ]
            details.setModule(createMockModule({children}))

            const content = details.shadowRoot.querySelector('.details-content')
            expect(content.textContent).toContain('children')
            expect(content.textContent).toContain('2')
        })

    })


    describe('inspect method rendering', () => {

        test('uses inspect() when module has it', () => {
            const module = createMockModule({
                inspect: () => ({health: 100, speed: 5})
            })
            details.setModule(module)

            const content = details.shadowRoot.querySelector('.details-content')
            expect(content.textContent).toContain('health')
            expect(content.textContent).toContain('100')
            expect(content.textContent).toContain('speed')
            expect(content.textContent).toContain('5')
        })

    })


    describe('inspector registration', () => {

        test('registerInspector should be a static method', () => {
            expect(typeof PerkyExplorerDetails.registerInspector).toBe('function')
        })


        test('unregisterInspector should be a static method', () => {
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
