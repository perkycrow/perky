import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import BaseEditorComponent from './base_editor_component.js'
import Notifier from '../core/notifier.js'


class TestComponent extends BaseEditorComponent { }
customElements.define('test-base-editor-component', TestComponent)


describe('BaseEditorComponent', () => {

    let component
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        component = document.createElement('test-base-editor-component')
        container.appendChild(component)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        it('should extend HTMLElement', () => {
            expect(component).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(component.shadowRoot).not.toBeNull()
        })

    })


    describe('listenTo', () => {

        it('should register listener on target', () => {
            const target = new Notifier()
            const callback = vi.fn()

            component.listenTo(target, 'test', callback)

            target.emit('test', 'value')
            expect(callback).toHaveBeenCalledWith('value')
        })


        it('should track multiple listeners', () => {
            const target1 = new Notifier()
            const target2 = new Notifier()
            const callback1 = vi.fn()
            const callback2 = vi.fn()

            component.listenTo(target1, 'event1', callback1)
            component.listenTo(target2, 'event2', callback2)

            target1.emit('event1')
            target2.emit('event2')

            expect(callback1).toHaveBeenCalled()
            expect(callback2).toHaveBeenCalled()
        })

    })


    describe('cleanListeners', () => {

        it('should remove all registered listeners', () => {
            const target = new Notifier()
            const callback = vi.fn()

            component.listenTo(target, 'test', callback)
            component.cleanListeners()

            target.emit('test', 'value')
            expect(callback).not.toHaveBeenCalled()
        })


        it('should handle multiple listeners from multiple targets', () => {
            const target1 = new Notifier()
            const target2 = new Notifier()
            const callback1 = vi.fn()
            const callback2 = vi.fn()

            component.listenTo(target1, 'event1', callback1)
            component.listenTo(target2, 'event2', callback2)
            component.cleanListeners()

            target1.emit('event1')
            target2.emit('event2')

            expect(callback1).not.toHaveBeenCalled()
            expect(callback2).not.toHaveBeenCalled()
        })

    })


    describe('disconnectedCallback', () => {

        it('should clean listeners when removed from DOM', () => {
            const target = new Notifier()
            const callback = vi.fn()

            component.listenTo(target, 'test', callback)
            component.remove()

            target.emit('test', 'value')
            expect(callback).not.toHaveBeenCalled()
        })

    })

})
