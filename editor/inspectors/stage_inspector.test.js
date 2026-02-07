import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import StageInspector from './stage_inspector.js'
import Stage from '../../game/stage.js'


class MockStage extends Stage {

    constructor (options = {}) {
        super(options)
        this.world = options.world || null
        this.game = options.game || null
    }

}


describe('StageInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('stage-inspector')
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

        test('matches Stage instance', () => {
            const stage = new MockStage({game: {}})
            expect(StageInspector.matches(stage)).toBe(true)
        })


        test('does not match non-Stage', () => {
            expect(StageInspector.matches({})).toBe(false)
            expect(StageInspector.matches(null)).toBe(false)
            expect(StageInspector.matches('string')).toBe(false)
        })

    })


    describe('setModule', () => {

        test('stores the module', () => {
            const stage = new MockStage({game: {}})
            inspector.setModule(stage)
            expect(inspector.getModule()).toBe(stage)
        })


        test('displays world info', () => {
            const stage = new MockStage({
                world: {$id: 'test-world'},
                game: {$id: 'test-game'}
            })
            inspector.setModule(stage)

            const grid = inspector.shadowRoot.querySelector('.inspector-grid')
            expect(grid.textContent).toContain('world')
            expect(grid.textContent).toContain('test-world')
        })


        test('displays game info', () => {
            const stage = new MockStage({
                world: {$id: 'test-world'},
                game: {$id: 'test-game'}
            })
            inspector.setModule(stage)

            const grid = inspector.shadowRoot.querySelector('.inspector-grid')
            expect(grid.textContent).toContain('game')
            expect(grid.textContent).toContain('test-game')
        })


        test('displays (none) when world is missing', () => {
            const stage = new MockStage({game: {}})
            inspector.setModule(stage)

            const grid = inspector.shadowRoot.querySelector('.inspector-grid')
            expect(grid.textContent).toContain('(none)')
        })


        test('displays view count', () => {
            const stage = new MockStage({game: {}})
            stage.viewsGroup.children = [{}, {}, {}]
            inspector.setModule(stage)

            const grid = inspector.shadowRoot.querySelector('.inspector-grid')
            expect(grid.textContent).toContain('views')
            expect(grid.textContent).toContain('3')
        })

    })


    describe('scene tree button', () => {

        test('shows scene tree button when views exist', () => {
            const stage = new MockStage({game: {}})
            stage.viewsGroup.children = [{}]
            inspector.setModule(stage)

            const actions = inspector.shadowRoot.querySelector('.inspector-actions')
            const button = actions.querySelector('button')
            expect(button).not.toBeNull()
            expect(button.textContent).toContain('Scene Tree')
        })


        test('does not show scene tree button when no views', () => {
            const stage = new MockStage({game: {}})
            stage.viewsGroup.children = []
            inspector.setModule(stage)

            const actions = inspector.shadowRoot.querySelector('.inspector-actions')
            const button = actions.querySelector('button')
            expect(button).toBeNull()
        })


        test('dispatches open:scene-tree event on button click', () => {
            const stage = new MockStage({game: {}})
            stage.viewsGroup.children = [{}]
            inspector.setModule(stage)

            const eventSpy = vi.fn()
            inspector.addEventListener('open:scene-tree', eventSpy)

            const button = inspector.shadowRoot.querySelector('button')
            button.click()

            expect(eventSpy).toHaveBeenCalledTimes(1)
            expect(eventSpy.mock.calls[0][0].detail.stage).toBe(stage)
            expect(eventSpy.mock.calls[0][0].detail.content).toBe(stage.viewsGroup)
        })

    })


    test('clears content when module changes', () => {
        const stage1 = new MockStage({world: {$id: 'world-1'}, game: {}})
        stage1.viewsGroup.children = []
        inspector.setModule(stage1)

        const stage2 = new MockStage({world: {$id: 'world-2'}, game: {}})
        stage2.viewsGroup.children = []
        inspector.setModule(stage2)

        const grid = inspector.shadowRoot.querySelector('.inspector-grid')
        expect(grid.textContent).toContain('world-2')
        expect(grid.textContent).not.toContain('world-1')
    })

})
