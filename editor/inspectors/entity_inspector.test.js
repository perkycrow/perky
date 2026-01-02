import {describe, test, expect, beforeEach, afterEach} from 'vitest'
import EntityInspector from './entity_inspector.js'


class MockVec2Input extends HTMLElement {

    #value = null


    set value (v) {
        this.#value = v
    }


    get value () {
        return this.#value
    }

}


if (!customElements.get('vec2-input')) {
    customElements.define('vec2-input', MockVec2Input)
}


class MockEntity {

    constructor (position = {x: 0, y: 0}) {
        this.position = position
    }

}


describe('EntityInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('entity-inspector')
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


        test('has vec2-input element', () => {
            const input = inspector.shadowRoot.querySelector('vec2-input')
            expect(input).not.toBeNull()
        })


        test('vec2-input has label attribute', () => {
            const input = inspector.shadowRoot.querySelector('vec2-input')
            expect(input.getAttribute('label')).toBe('Position')
        })

    })


    test('matches static matches method exists', () => {
        expect(typeof EntityInspector.matches).toBe('function')
    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockEntity()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('sets position input value when module is set', () => {
            const position = {x: 100, y: 200}
            const module = new MockEntity(position)
            inspector.setModule(module)

            const input = inspector.shadowRoot.querySelector('vec2-input')
            expect(input.value).toBe(position)
        })

    })


    test('position input updates when module changes', () => {
        const module1 = new MockEntity({x: 10, y: 20})
        inspector.setModule(module1)

        const input = inspector.shadowRoot.querySelector('vec2-input')
        expect(input.value).toEqual({x: 10, y: 20})

        const module2 = new MockEntity({x: 50, y: 60})
        inspector.setModule(module2)
        expect(input.value).toEqual({x: 50, y: 60})
    })

})
