import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import WorldViewInspector from './world_view_inspector.js'


class MockWorldView {

    constructor (options = {}) {
        this.world = options.world || null
        this.game = options.game || null
        this.rootGroup = options.rootGroup || null
    }

}


describe('WorldViewInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('world-view-inspector')
        container.appendChild(inspector)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(inspector).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(inspector.shadowRoot).not.toBeNull()
        })


        test('has gridEl after buildDOM', () => {
            expect(inspector.gridEl).not.toBeNull()
        })

    })


    test('matches static matches method exists', () => {
        expect(typeof WorldViewInspector.matches).toBe('function')
    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockWorldView()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('renders world view info when module is set', () => {
            const module = new MockWorldView()
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            expect(labels.length).toBeGreaterThan(0)
        })

    })


    describe('rendering', () => {

        test('shows world id', () => {
            const module = new MockWorldView({
                world: {$id: 'main-world'}
            })
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasWorld = Array.from(values).some(v => v.textContent === 'main-world')
            expect(hasWorld).toBe(true)
        })


        test('shows none when no world', () => {
            const module = new MockWorldView({world: null})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasNone = Array.from(values).some(v => v.textContent === '(none)')
            expect(hasNone).toBe(true)
        })


        test('shows game id', () => {
            const module = new MockWorldView({
                game: {$id: 'my-game'}
            })
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasGame = Array.from(values).some(v => v.textContent === 'my-game')
            expect(hasGame).toBe(true)
        })


        test('shows none when no game', () => {
            const module = new MockWorldView({game: null})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const noneCount = Array.from(values).filter(v => v.textContent === '(none)').length
            expect(noneCount).toBeGreaterThanOrEqual(2)
        })


        test('shows entity count', () => {
            const module = new MockWorldView({
                rootGroup: {children: [{}, {}, {}, {}]}
            })
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value.accent')
            const hasCount = Array.from(values).some(v => v.textContent === '4')
            expect(hasCount).toBe(true)
        })


        test('shows zero entities when rootGroup has no children', () => {
            const module = new MockWorldView({
                rootGroup: {children: []}
            })
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasZero = Array.from(values).some(v => v.textContent === '0')
            expect(hasZero).toBe(true)
        })


        test('shows zero entities when no rootGroup', () => {
            const module = new MockWorldView({rootGroup: null})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasZero = Array.from(values).some(v => v.textContent === '0')
            expect(hasZero).toBe(true)
        })

    })


    describe('scene tree button', () => {

        test('shows Scene Tree button when rootGroup has children', () => {
            const module = new MockWorldView({
                rootGroup: {children: [{}]}
            })
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn).not.toBeNull()
            expect(btn.textContent).toContain('Scene Tree')
        })


        test('does not show button when no rootGroup', () => {
            const module = new MockWorldView({rootGroup: null})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn).toBeNull()
        })


        test('does not show button when rootGroup has no children', () => {
            const module = new MockWorldView({
                rootGroup: {children: []}
            })
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn).toBeNull()
        })


        test('dispatches open:scene-tree event when clicked', () => {
            const rootGroup = {children: [{}]}
            const module = new MockWorldView({rootGroup})
            inspector.setModule(module)

            const eventHandler = vi.fn()
            inspector.addEventListener('open:scene-tree', eventHandler)

            const btn = inspector.actionsEl.querySelector('button')
            btn.click()

            expect(eventHandler).toHaveBeenCalled()
            expect(eventHandler.mock.calls[0][0].detail.content).toBe(rootGroup)
            expect(eventHandler.mock.calls[0][0].detail.worldView).toBe(module)
        })

    })


    test('clearContent clears and re-renders on module change', () => {
        const module1 = new MockWorldView({
            world: {$id: 'world-1'}
        })
        inspector.setModule(module1)

        const module2 = new MockWorldView({
            world: {$id: 'world-2'}
        })
        inspector.setModule(module2)

        const values = inspector.gridEl.querySelectorAll('.inspector-value')
        const hasNew = Array.from(values).some(v => v.textContent === 'world-2')
        const hasOld = Array.from(values).some(v => v.textContent === 'world-1')

        expect(hasNew).toBe(true)
        expect(hasOld).toBe(false)
    })

})
