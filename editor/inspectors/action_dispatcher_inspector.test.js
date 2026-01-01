import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import ActionDispatcherInspector from './action_dispatcher_inspector.js'


class MockActionDispatcher {

    #actionsMap = new Map()


    constructor (actionsMap = new Map()) {
        this.#actionsMap = actionsMap
    }


    listAllActions () {
        return this.#actionsMap
    }


    executeTo (controllerName, actionName) {
        this.lastExecuted = {controllerName, actionName}
    }

}


describe('ActionDispatcherInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('action-dispatcher-inspector')
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


        test('hides gridEl', () => {
            expect(inspector.gridEl.style.display).toBe('none')
        })

    })


    test('matches static matches method exists', () => {
        expect(typeof ActionDispatcherInspector.matches).toBe('function')
    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockActionDispatcher()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('renders controller groups when module is set', () => {
            const actionsMap = new Map([
                ['player', ['jump', 'run']],
                ['enemy', ['attack']]
            ])
            const module = new MockActionDispatcher(actionsMap)
            inspector.setModule(module)

            const groups = inspector.shadowRoot.querySelectorAll('.controller-group')
            expect(groups.length).toBe(2)
        })

    })


    describe('rendering', () => {

        test('shows header with total action and controller count', () => {
            const actionsMap = new Map([
                ['player', ['jump', 'run']],
                ['enemy', ['attack']]
            ])
            const module = new MockActionDispatcher(actionsMap)
            inspector.setModule(module)

            const header = inspector.shadowRoot.querySelector('.actions-header')
            expect(header).not.toBeNull()
            expect(header.textContent).toContain('3')
            expect(header.textContent).toContain('2')
        })


        test('shows empty message when no controllers', () => {
            const module = new MockActionDispatcher(new Map())
            inspector.setModule(module)

            const empty = inspector.shadowRoot.querySelector('.empty-message')
            expect(empty).not.toBeNull()
            expect(empty.textContent).toBe('No controllers registered')
        })


        test('renders controller group headers', () => {
            const actionsMap = new Map([
                ['player', ['jump']]
            ])
            const module = new MockActionDispatcher(actionsMap)
            inspector.setModule(module)

            const groupName = inspector.shadowRoot.querySelector('.group-name')
            expect(groupName).not.toBeNull()
            expect(groupName.textContent).toBe('player')
        })


        test('shows group count badge', () => {
            const actionsMap = new Map([
                ['player', ['jump', 'run', 'attack']]
            ])
            const module = new MockActionDispatcher(actionsMap)
            inspector.setModule(module)

            const count = inspector.shadowRoot.querySelector('.group-count')
            expect(count).not.toBeNull()
            expect(count.textContent).toBe('3')
        })


        test('renders action cards with names', () => {
            const actionsMap = new Map([
                ['player', ['jump', 'attack']]
            ])
            const module = new MockActionDispatcher(actionsMap)
            inspector.setModule(module)

            const names = inspector.shadowRoot.querySelectorAll('.action-name')
            expect(names.length).toBe(2)
            expect(names[0].textContent).toBe('jump')
            expect(names[1].textContent).toBe('attack')
        })


        test('shows empty message in group when controller has no actions', () => {
            const actionsMap = new Map([
                ['player', []]
            ])
            const module = new MockActionDispatcher(actionsMap)
            inspector.setModule(module)

            const empty = inspector.shadowRoot.querySelector('.controller-group .empty-message')
            expect(empty).not.toBeNull()
            expect(empty.textContent).toBe('No actions')
        })

    })


    test('execute button calls module.executeTo when clicked', () => {
        const actionsMap = new Map([
            ['player', ['jump']]
        ])
        const module = new MockActionDispatcher(actionsMap)
        module.executeTo = vi.fn()
        inspector.setModule(module)

        const btn = inspector.shadowRoot.querySelector('.execute-btn')
        btn.click()

        expect(module.executeTo).toHaveBeenCalledWith('player', 'jump')
    })

})
