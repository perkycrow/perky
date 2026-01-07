import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import ActionDispatcherInspector from './action_dispatcher_inspector.js'


class MockActionDispatcher {

    #actionsMap = new Map()
    #activeControllers = []


    constructor (actionsMap = new Map(), activeControllers = []) {
        this.#actionsMap = actionsMap
        this.#activeControllers = activeControllers
    }


    listAllActions () {
        return this.#actionsMap
    }


    getActive () {
        return [...this.#activeControllers]
    }


    setActive (names) {
        this.#activeControllers = [...names]
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
                ['player', [{name: 'jump'}, {name: 'run'}]],
                ['enemy', [{name: 'attack'}]]
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
                ['player', [{name: 'jump'}, {name: 'run'}]],
                ['enemy', [{name: 'attack'}]]
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
                ['player', [{name: 'jump'}]]
            ])
            const module = new MockActionDispatcher(actionsMap)
            inspector.setModule(module)

            const groupName = inspector.shadowRoot.querySelector('.group-name')
            expect(groupName).not.toBeNull()
            expect(groupName.textContent).toBe('player')
        })


        test('renders action cards with names', () => {
            const actionsMap = new Map([
                ['player', [{name: 'jump'}, {name: 'attack'}]]
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
            ['player', [{name: 'jump'}]]
        ])
        const module = new MockActionDispatcher(actionsMap, ['player'])
        module.executeTo = vi.fn()
        inspector.setModule(module)

        const btn = inspector.shadowRoot.querySelector('.execute-btn')
        btn.click()

        expect(module.executeTo).toHaveBeenCalledWith('player', 'jump')
    })


    describe('active controller toggle', () => {

        test('renders toggle for each controller group', () => {
            const actionsMap = new Map([
                ['player', [{name: 'jump'}]],
                ['enemy', [{name: 'attack'}]]
            ])
            const module = new MockActionDispatcher(actionsMap, ['player'])
            inspector.setModule(module)

            const toggles = inspector.shadowRoot.querySelectorAll('toggle-input')
            expect(toggles.length).toBe(2)
        })


        test('toggle is checked when controller is active', () => {
            const actionsMap = new Map([
                ['player', [{name: 'jump'}]]
            ])
            const module = new MockActionDispatcher(actionsMap, ['player'])
            inspector.setModule(module)

            const toggle = inspector.shadowRoot.querySelector('toggle-input')
            expect(toggle.checked).toBe(true)
        })


        test('toggle is unchecked when controller is inactive', () => {
            const actionsMap = new Map([
                ['player', [{name: 'jump'}]]
            ])
            const module = new MockActionDispatcher(actionsMap, [])
            inspector.setModule(module)

            const toggle = inspector.shadowRoot.querySelector('toggle-input')
            expect(toggle.checked).toBe(false)
        })


        test('inactive controller group has group-inactive class', () => {
            const actionsMap = new Map([
                ['player', [{name: 'jump'}]]
            ])
            const module = new MockActionDispatcher(actionsMap, [])
            inspector.setModule(module)

            const group = inspector.shadowRoot.querySelector('.controller-group')
            expect(group.classList.contains('group-inactive')).toBe(true)
        })


        test('active controller group does not have group-inactive class', () => {
            const actionsMap = new Map([
                ['player', [{name: 'jump'}]]
            ])
            const module = new MockActionDispatcher(actionsMap, ['player'])
            inspector.setModule(module)

            const group = inspector.shadowRoot.querySelector('.controller-group')
            expect(group.classList.contains('group-inactive')).toBe(false)
        })


        test('clicking toggle activates inactive controller', () => {
            const actionsMap = new Map([
                ['player', [{name: 'jump'}]]
            ])
            const module = new MockActionDispatcher(actionsMap, [])
            module.setActive = vi.fn()
            inspector.setModule(module)

            const toggle = inspector.shadowRoot.querySelector('toggle-input')
            toggle.dispatchEvent(new CustomEvent('change', {detail: {checked: true}}))

            expect(module.setActive).toHaveBeenCalledWith(['player'])
        })


        test('clicking toggle deactivates active controller', () => {
            const actionsMap = new Map([
                ['player', [{name: 'jump'}]],
                ['enemy', [{name: 'attack'}]]
            ])
            const module = new MockActionDispatcher(actionsMap, ['player', 'enemy'])
            module.setActive = vi.fn()
            inspector.setModule(module)

            const toggle = inspector.shadowRoot.querySelector('toggle-input')
            toggle.dispatchEvent(new CustomEvent('change', {detail: {checked: false}}))

            expect(module.setActive).toHaveBeenCalledWith(['enemy'])
        })

    })

})
