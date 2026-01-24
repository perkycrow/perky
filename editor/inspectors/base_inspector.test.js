import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import BaseInspector from './base_inspector.js'
import Notifier from '../../core/notifier.js'


class TestInspector extends BaseInspector {

    constructor () {
        super()
        this.buildDOM()
    }


    onModuleSet (module) {
        this.moduleSetCalled = true
        this.moduleSetWith = module
    }

}

customElements.define('test-base-inspector', TestInspector)


describe('BaseInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('test-base-inspector')
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


        test('has grid element after buildDOM', () => {
            expect(inspector.gridEl).not.toBeNull()
        })


        test('has actions element after buildDOM', () => {
            expect(inspector.actionsEl).not.toBeNull()
        })

    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = {name: 'test'}
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('calls onModuleSet hook', () => {
            const module = {name: 'test'}
            inspector.setModule(module)

            expect(inspector.moduleSetCalled).toBe(true)
            expect(inspector.moduleSetWith).toBe(module)
        })


        test('exposes module via module getter', () => {
            const module = {name: 'test'}
            inspector.setModule(module)
            expect(inspector.module).toBe(module)
        })


        test('cleans listeners when setting new module', () => {
            const target = new Notifier()
            const callback = vi.fn()

            inspector.listenTo(target, 'test', callback)
            inspector.setModule({name: 'new'})

            target.emit('test')
            expect(callback).not.toHaveBeenCalled()
        })

    })


    describe('addRow', () => {

        test('creates label and value elements', () => {
            inspector.addRow('Label', 'Value')

            const label = inspector.gridEl.querySelector('.inspector-label')
            const value = inspector.gridEl.querySelector('.inspector-value')

            expect(label.textContent).toBe('Label')
            expect(value.textContent).toBe('Value')
        })


        test('returns the value element', () => {
            const valueEl = inspector.addRow('Label', 'Value')
            expect(valueEl.textContent).toBe('Value')
        })


        test('adds accent class when isAccent is true', () => {
            const valueEl = inspector.addRow('Label', 'Value', true)
            expect(valueEl.classList.contains('accent')).toBe(true)
        })


        test('supports function as value', () => {
            const valueEl = inspector.addRow('Label', () => 'computed')
            expect(valueEl.textContent).toBe('computed')
        })

    })


    test('addSeparator should add separator element', () => {
        inspector.addSeparator()

        const separator = inspector.gridEl.querySelector('.inspector-separator')
        expect(separator).not.toBeNull()
    })


    describe('createButton', () => {

        test('creates button element', () => {
            const btn = inspector.createButton('🔥', 'Fire', () => { })

            expect(btn.tagName).toBe('BUTTON')
            expect(btn.className).toBe('inspector-btn')
            expect(btn.textContent).toContain('Fire')
        })


        test('calls onClick when clicked', () => {
            const onClick = vi.fn()
            const btn = inspector.createButton('', 'Click', onClick)

            btn.click()

            expect(onClick).toHaveBeenCalled()
        })

    })


    test('clearContent should clear grid and actions', () => {
        inspector.addRow('Label', 'Value')
        inspector.actionsEl.appendChild(inspector.createButton('', 'Test', () => { }))

        inspector.clearContent()

        expect(inspector.gridEl.innerHTML).toBe('')
        expect(inspector.actionsEl.innerHTML).toBe('')
    })

})
