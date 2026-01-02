import {describe, test, expect, beforeEach, afterEach} from 'vitest'
import InputBinderInspector from './input_binder_inspector.js'


class MockBinding {

    constructor (options = {}) {
        this.actionName = options.actionName || 'jump'
        this.deviceName = options.deviceName || 'keyboard'
        this.controlName = options.controlName || 'Space'
        this.controllerName = options.controllerName || null
        this.eventType = options.eventType || 'pressed'
    }

}


class MockInputBinder {

    #bindings

    constructor (bindings = []) {
        this.#bindings = bindings
    }


    getAllBindings () {
        return this.#bindings
    }

}


describe('InputBinderInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('input-binder-inspector')
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
        expect(typeof InputBinderInspector.matches).toBe('function')
    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockInputBinder()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('renders bindings when module is set', () => {
            const bindings = [
                new MockBinding({actionName: 'jump'}),
                new MockBinding({actionName: 'attack'})
            ]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const cards = inspector.shadowRoot.querySelectorAll('.binding-card')
            expect(cards.length).toBe(2)
        })

    })


    describe('rendering', () => {

        test('shows header with binding count', () => {
            const bindings = [new MockBinding(), new MockBinding()]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const count = inspector.shadowRoot.querySelector('.bindings-count')
            expect(count).not.toBeNull()
            expect(count.textContent).toContain('2')
        })


        test('shows empty message when no bindings', () => {
            const module = new MockInputBinder([])
            inspector.setModule(module)

            const empty = inspector.shadowRoot.querySelector('.empty-message')
            expect(empty).not.toBeNull()
            expect(empty.textContent).toBe('No input bindings defined')
        })


        test('renders binding device badge', () => {
            const bindings = [new MockBinding({deviceName: 'gamepad'})]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const badge = inspector.shadowRoot.querySelector('.device-badge')
            expect(badge).not.toBeNull()
            expect(badge.textContent).toBe('gamepad')
        })


        test('renders control name', () => {
            const bindings = [new MockBinding({controlName: 'KeyW'})]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const control = inspector.shadowRoot.querySelector('.control-name')
            expect(control).not.toBeNull()
            expect(control.textContent).toBe('KeyW')
        })


        test('renders action name', () => {
            const bindings = [new MockBinding({actionName: 'moveUp'})]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const action = inspector.shadowRoot.querySelector('.action-name')
            expect(action).not.toBeNull()
            expect(action.textContent).toBe('moveUp')
        })


        test('renders controller badge when present', () => {
            const bindings = [new MockBinding({controllerName: 'player'})]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const badge = inspector.shadowRoot.querySelector('.controller-badge')
            expect(badge).not.toBeNull()
            expect(badge.textContent).toBe('player')
        })


        test('renders event type badge', () => {
            const bindings = [new MockBinding({eventType: 'released'})]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const badge = inspector.shadowRoot.querySelector('.event-badge')
            expect(badge).not.toBeNull()
            expect(badge.textContent).toBe('released')
            expect(badge.classList.contains('released')).toBe(true)
        })

    })


    describe('view toggle', () => {

        test('shows view toggle buttons', () => {
            const bindings = [new MockBinding()]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const toggle = inspector.shadowRoot.querySelector('.view-toggle')
            expect(toggle).not.toBeNull()

            const buttons = toggle.querySelectorAll('.view-btn')
            expect(buttons.length).toBe(2)
        })


        test('By Action button is active by default', () => {
            const bindings = [new MockBinding()]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const buttons = inspector.shadowRoot.querySelectorAll('.view-btn')
            expect(buttons[0].textContent).toBe('By Action')
            expect(buttons[0].classList.contains('active')).toBe(true)
        })


        test('clicking By Device switches view mode', () => {
            const bindings = [
                new MockBinding({actionName: 'jump', deviceName: 'keyboard'}),
                new MockBinding({actionName: 'jump', deviceName: 'gamepad'})
            ]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const deviceBtn = inspector.shadowRoot.querySelectorAll('.view-btn')[1]
            deviceBtn.click()

            const updatedDeviceBtn = inspector.shadowRoot.querySelectorAll('.view-btn')[1]
            expect(updatedDeviceBtn.classList.contains('active')).toBe(true)
        })

    })


    describe('grouping by action', () => {

        test('groups bindings by action name', () => {
            const bindings = [
                new MockBinding({actionName: 'jump'}),
                new MockBinding({actionName: 'jump'}),
                new MockBinding({actionName: 'attack'})
            ]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const groups = inspector.shadowRoot.querySelectorAll('.binding-group')
            expect(groups.length).toBe(2)
        })


        test('shows group header with action name', () => {
            const bindings = [new MockBinding({actionName: 'jump'})]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const groupName = inspector.shadowRoot.querySelector('.group-name')
            expect(groupName).not.toBeNull()
            expect(groupName.textContent).toBe('jump')
        })


        test('shows binding count in group', () => {
            const bindings = [
                new MockBinding({actionName: 'jump'}),
                new MockBinding({actionName: 'jump'}),
                new MockBinding({actionName: 'jump'})
            ]
            const module = new MockInputBinder(bindings)
            inspector.setModule(module)

            const count = inspector.shadowRoot.querySelector('.group-count')
            expect(count).not.toBeNull()
            expect(count.textContent).toBe('3')
        })

    })


    test('grouping by device groups bindings by device name', () => {
        const bindings = [
            new MockBinding({deviceName: 'keyboard'}),
            new MockBinding({deviceName: 'keyboard'}),
            new MockBinding({deviceName: 'gamepad'})
        ]
        const module = new MockInputBinder(bindings)
        inspector.setModule(module)

        const deviceBtn = inspector.shadowRoot.querySelectorAll('.view-btn')[1]
        deviceBtn.click()

        const groups = inspector.shadowRoot.querySelectorAll('.binding-group')
        expect(groups.length).toBe(2)
    })

})
