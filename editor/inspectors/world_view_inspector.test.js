import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import WorldViewInspector from './world_view_inspector.js'
import WorldView from '../../game/world_view.js'


class MockWorldView extends WorldView {

    constructor (options = {}) {
        super(options)
        this.world = options.world || null
        this.game = options.game || null
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


        test('has inspector grid element', () => {
            const grid = inspector.shadowRoot.querySelector('.inspector-grid')
            expect(grid).not.toBeNull()
        })


        test('has inspector actions element', () => {
            const actions = inspector.shadowRoot.querySelector('.inspector-actions')
            expect(actions).not.toBeNull()
        })

    })


    describe('static matches', () => {

        test('matches WorldView instance', () => {
            const worldView = new MockWorldView()
            expect(WorldViewInspector.matches(worldView)).toBe(true)
        })


        test('does not match non-WorldView', () => {
            expect(WorldViewInspector.matches({})).toBe(false)
            expect(WorldViewInspector.matches(null)).toBe(false)
            expect(WorldViewInspector.matches('string')).toBe(false)
        })

    })


    describe('setModule', () => {

        test('stores the module', () => {
            const worldView = new MockWorldView()
            inspector.setModule(worldView)
            expect(inspector.getModule()).toBe(worldView)
        })


        test('displays world info', () => {
            const worldView = new MockWorldView({
                world: {$id: 'test-world'},
                game: {$id: 'test-game'}
            })
            inspector.setModule(worldView)

            const grid = inspector.shadowRoot.querySelector('.inspector-grid')
            expect(grid.textContent).toContain('world')
            expect(grid.textContent).toContain('test-world')
        })


        test('displays game info', () => {
            const worldView = new MockWorldView({
                world: {$id: 'test-world'},
                game: {$id: 'test-game'}
            })
            inspector.setModule(worldView)

            const grid = inspector.shadowRoot.querySelector('.inspector-grid')
            expect(grid.textContent).toContain('game')
            expect(grid.textContent).toContain('test-game')
        })


        test('displays (none) when world is missing', () => {
            const worldView = new MockWorldView()
            inspector.setModule(worldView)

            const grid = inspector.shadowRoot.querySelector('.inspector-grid')
            expect(grid.textContent).toContain('(none)')
        })


        test('displays entity count', () => {
            const worldView = new MockWorldView()
            worldView.rootGroup = {children: [{}, {}, {}]}
            inspector.setModule(worldView)

            const grid = inspector.shadowRoot.querySelector('.inspector-grid')
            expect(grid.textContent).toContain('entities')
            expect(grid.textContent).toContain('3')
        })

    })


    describe('scene tree button', () => {

        test('shows scene tree button when entities exist', () => {
            const worldView = new MockWorldView()
            worldView.rootGroup = {children: [{}]}
            inspector.setModule(worldView)

            const actions = inspector.shadowRoot.querySelector('.inspector-actions')
            const button = actions.querySelector('button')
            expect(button).not.toBeNull()
            expect(button.textContent).toContain('Scene Tree')
        })


        test('does not show scene tree button when no entities', () => {
            const worldView = new MockWorldView()
            worldView.rootGroup = {children: []}
            inspector.setModule(worldView)

            const actions = inspector.shadowRoot.querySelector('.inspector-actions')
            const button = actions.querySelector('button')
            expect(button).toBeNull()
        })


        test('dispatches open:scene-tree event on button click', () => {
            const worldView = new MockWorldView()
            worldView.rootGroup = {children: [{}]}
            inspector.setModule(worldView)

            const eventSpy = vi.fn()
            inspector.addEventListener('open:scene-tree', eventSpy)

            const button = inspector.shadowRoot.querySelector('button')
            button.click()

            expect(eventSpy).toHaveBeenCalledTimes(1)
            expect(eventSpy.mock.calls[0][0].detail.worldView).toBe(worldView)
            expect(eventSpy.mock.calls[0][0].detail.content).toBe(worldView.rootGroup)
        })

    })


    test('clears content when module changes', () => {
        const worldView1 = new MockWorldView({world: {$id: 'world-1'}})
        worldView1.rootGroup = {children: []}
        inspector.setModule(worldView1)

        const worldView2 = new MockWorldView({world: {$id: 'world-2'}})
        worldView2.rootGroup = {children: []}
        inspector.setModule(worldView2)

        const grid = inspector.shadowRoot.querySelector('.inspector-grid')
        expect(grid.textContent).toContain('world-2')
        expect(grid.textContent).not.toContain('world-1')
    })

})
