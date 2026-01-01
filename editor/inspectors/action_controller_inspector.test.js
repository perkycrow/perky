import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import ActionControllerInspector from './action_controller_inspector.js'


class MockActionController {

    #actions = []
    #propagable = new Set()


    constructor (actions = [], propagable = []) {
        this.#actions = actions
        this.#propagable = new Set(propagable)
    }


    listActions () {
        return this.#actions
    }


    shouldPropagate (actionName) {
        return this.#propagable.has(actionName)
    }


    execute (actionName) {
        this.lastExecuted = actionName
    }

}


describe('ActionControllerInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('action-controller-inspector')
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


    test('matches returns true for ActionController instances', () => {
        const mock = new MockActionController()
        Object.setPrototypeOf(mock, {constructor: {name: 'ActionController'}})

        const matches = ActionControllerInspector.matches
        expect(typeof matches).toBe('function')
    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockActionController(['jump'])
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('renders actions when module is set', () => {
            const module = new MockActionController(['jump', 'run'])
            inspector.setModule(module)

            const actionCards = inspector.shadowRoot.querySelectorAll('.action-card')
            expect(actionCards.length).toBe(2)
        })

    })


    describe('rendering', () => {

        test('shows header with action count', () => {
            const module = new MockActionController(['a', 'b', 'c'])
            inspector.setModule(module)

            const header = inspector.shadowRoot.querySelector('.actions-header')
            expect(header).not.toBeNull()
            expect(header.textContent).toContain('3')
        })


        test('shows empty message when no actions', () => {
            const module = new MockActionController([])
            inspector.setModule(module)

            const empty = inspector.shadowRoot.querySelector('.empty-message')
            expect(empty).not.toBeNull()
            expect(empty.textContent).toBe('No actions defined')
        })


        test('renders action names', () => {
            const module = new MockActionController(['jump', 'attack'])
            inspector.setModule(module)

            const names = inspector.shadowRoot.querySelectorAll('.action-name')
            expect(names.length).toBe(2)
            expect(names[0].textContent).toBe('jump')
            expect(names[1].textContent).toBe('attack')
        })


        test('shows propagable badge for propagable actions', () => {
            const module = new MockActionController(['jump', 'attack'], ['jump'])
            inspector.setModule(module)

            const badges = inspector.shadowRoot.querySelectorAll('.action-badge.propagable')
            expect(badges.length).toBe(1)
            expect(badges[0].textContent).toBe('propagable')
        })


        test('renders execute button for each action', () => {
            const module = new MockActionController(['jump'])
            inspector.setModule(module)

            const btn = inspector.shadowRoot.querySelector('.execute-btn')
            expect(btn).not.toBeNull()
            expect(btn.textContent).toContain('Run')
        })

    })


    test('execute button calls module.execute when clicked', () => {
        const module = new MockActionController(['jump'])
        module.execute = vi.fn()
        inspector.setModule(module)

        const btn = inspector.shadowRoot.querySelector('.execute-btn')
        btn.click()

        expect(module.execute).toHaveBeenCalledWith('jump')
    })

})
