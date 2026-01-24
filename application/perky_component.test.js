import {describe, test, expect, vi, beforeEach, afterEach} from 'vitest'
import PerkyComponent from './perky_component.js'
import {createStyleSheet} from './dom_utils.js'


describe('PerkyComponent', () => {

    let registeredElements = []

    function registerElement (name, ctor) {
        if (!customElements.get(name)) {
            customElements.define(name, ctor)
            registeredElements.push(name)
        }
    }

    afterEach(() => {
        registeredElements = []
    })


    describe('shadowRoot', () => {

        test('creates shadowRoot on construction', () => {
            registerElement('test-shadow', class extends PerkyComponent {})
            const el = document.createElement('test-shadow')
            expect(el.shadowRoot).toBeTruthy()
            expect(el.shadowRoot.mode).toBe('open')
        })

    })


    describe('static styles - string', () => {

        test('converts string styles to CSSStyleSheet', () => {
            class TestStyles extends PerkyComponent {
                static styles = '.test { color: red; }'
            }
            registerElement('test-string-styles', TestStyles)

            const el = document.createElement('test-string-styles')
            document.body.appendChild(el)

            expect(el.shadowRoot.adoptedStyleSheets.length).toBe(1)
            expect(el.shadowRoot.adoptedStyleSheets[0]).toBeInstanceOf(CSSStyleSheet)

            document.body.removeChild(el)
        })

    })


    describe('static styles - CSSStyleSheet', () => {

        test('uses CSSStyleSheet directly', () => {
            const sheet = createStyleSheet('.test { color: blue; }')

            class TestSheet extends PerkyComponent {
                static styles = sheet
            }
            registerElement('test-sheet-styles', TestSheet)

            const el = document.createElement('test-sheet-styles')
            document.body.appendChild(el)

            expect(el.shadowRoot.adoptedStyleSheets.length).toBe(1)
            expect(el.shadowRoot.adoptedStyleSheets[0]).toBe(sheet)

            document.body.removeChild(el)
        })

    })


    describe('static styles - array', () => {

        test('supports array of strings', () => {
            class TestArray extends PerkyComponent {
                static styles = ['.a {}', '.b {}']
            }
            registerElement('test-array-strings', TestArray)

            const el = document.createElement('test-array-strings')
            document.body.appendChild(el)

            expect(el.shadowRoot.adoptedStyleSheets.length).toBe(2)

            document.body.removeChild(el)
        })


        test('supports array with mixed types', () => {
            const sharedSheet = createStyleSheet('.shared {}')

            class TestMixed extends PerkyComponent {
                static styles = [sharedSheet, '.local {}']
            }
            registerElement('test-array-mixed', TestMixed)

            const el = document.createElement('test-array-mixed')
            document.body.appendChild(el)

            expect(el.shadowRoot.adoptedStyleSheets.length).toBe(2)
            expect(el.shadowRoot.adoptedStyleSheets[0]).toBe(sharedSheet)

            document.body.removeChild(el)
        })


        test('shared sheet is reused across components', () => {
            const sharedSheet = createStyleSheet('.shared {}')

            class CompA extends PerkyComponent {
                static styles = [sharedSheet, '.a {}']
            }

            class CompB extends PerkyComponent {
                static styles = [sharedSheet, '.b {}']
            }

            registerElement('test-shared-a', CompA)
            registerElement('test-shared-b', CompB)

            const elA = document.createElement('test-shared-a')
            const elB = document.createElement('test-shared-b')
            document.body.appendChild(elA)
            document.body.appendChild(elB)

            expect(elA.shadowRoot.adoptedStyleSheets[0]).toBe(sharedSheet)
            expect(elB.shadowRoot.adoptedStyleSheets[0]).toBe(sharedSheet)

            document.body.removeChild(elA)
            document.body.removeChild(elB)
        })

    })


    describe('style inheritance', () => {

        test('accumulates styles from parent to child', () => {
            class Parent extends PerkyComponent {
                static styles = '.parent { color: red; }'
            }

            class Child extends Parent {
                static styles = '.child { color: blue; }'
            }
            registerElement('test-inheritance', Child)

            const el = document.createElement('test-inheritance')
            document.body.appendChild(el)

            expect(el.shadowRoot.adoptedStyleSheets.length).toBe(2)

            document.body.removeChild(el)
        })


        test('parent styles come before child styles', () => {
            const parentSheet = createStyleSheet('.parent {}')
            const childSheet = createStyleSheet('.child {}')

            class Parent extends PerkyComponent {
                static styles = parentSheet
            }

            class Child extends Parent {
                static styles = childSheet
            }
            registerElement('test-order', Child)

            const el = document.createElement('test-order')
            document.body.appendChild(el)

            expect(el.shadowRoot.adoptedStyleSheets[0]).toBe(parentSheet)
            expect(el.shadowRoot.adoptedStyleSheets[1]).toBe(childSheet)

            document.body.removeChild(el)
        })


        test('skips classes without styles', () => {
            class Parent extends PerkyComponent {
                static styles = '.parent {}'
            }

            class Middle extends Parent {
                // no styles
            }

            class Child extends Middle {
                static styles = '.child {}'
            }
            registerElement('test-skip', Child)

            const el = document.createElement('test-skip')
            document.body.appendChild(el)

            expect(el.shadowRoot.adoptedStyleSheets.length).toBe(2)

            document.body.removeChild(el)
        })

    })


    describe('sheet caching', () => {

        test('reuses same sheet between instances', () => {
            class Cached extends PerkyComponent {
                static styles = '.cached {}'
            }
            registerElement('test-cache', Cached)

            const el1 = document.createElement('test-cache')
            const el2 = document.createElement('test-cache')
            document.body.appendChild(el1)
            document.body.appendChild(el2)

            expect(el1.shadowRoot.adoptedStyleSheets[0])
                .toBe(el2.shadowRoot.adoptedStyleSheets[0])

            document.body.removeChild(el1)
            document.body.removeChild(el2)
        })

    })


    describe('lifecycle hooks', () => {

        test('calls onConnected when connected', () => {
            const spy = vi.fn()

            class TestConnected extends PerkyComponent {
                onConnected () {
                    spy()
                }
            }
            registerElement('test-connected', TestConnected)

            const el = document.createElement('test-connected')
            expect(spy).not.toHaveBeenCalled()

            document.body.appendChild(el)
            expect(spy).toHaveBeenCalledOnce()

            document.body.removeChild(el)
        })


        test('calls onDisconnected when disconnected', () => {
            const spy = vi.fn()

            class TestDisconnected extends PerkyComponent {
                onDisconnected () {
                    spy()
                }
            }
            registerElement('test-disconnected', TestDisconnected)

            const el = document.createElement('test-disconnected')
            document.body.appendChild(el)
            expect(spy).not.toHaveBeenCalled()

            document.body.removeChild(el)
            expect(spy).toHaveBeenCalledOnce()
        })

    })


    describe('listenTo', () => {

        test('registers listener on target', () => {
            const mockTarget = {
                on: vi.fn(),
                off: vi.fn()
            }
            const callback = vi.fn()

            class TestListen extends PerkyComponent {}
            registerElement('test-listen', TestListen)

            const el = document.createElement('test-listen')
            el.listenTo(mockTarget, 'change', callback)

            expect(mockTarget.on).toHaveBeenCalledWith('change', callback)
        })


        test('cleans up listeners on disconnect', () => {
            const mockTarget = {
                on: vi.fn(),
                off: vi.fn()
            }
            const callback = vi.fn()

            class TestCleanup extends PerkyComponent {}
            registerElement('test-cleanup', TestCleanup)

            const el = document.createElement('test-cleanup')
            document.body.appendChild(el)

            el.listenTo(mockTarget, 'update', callback)

            document.body.removeChild(el)
            expect(mockTarget.off).toHaveBeenCalledWith('update', callback)
        })


        test('cleans up multiple listeners', () => {
            const target1 = {on: vi.fn(), off: vi.fn()}
            const target2 = {on: vi.fn(), off: vi.fn()}

            class TestMulti extends PerkyComponent {}
            registerElement('test-multi', TestMulti)

            const el = document.createElement('test-multi')
            document.body.appendChild(el)

            el.listenTo(target1, 'event1', () => {})
            el.listenTo(target2, 'event2', () => {})

            document.body.removeChild(el)

            expect(target1.off).toHaveBeenCalledOnce()
            expect(target2.off).toHaveBeenCalledOnce()
        })

    })


    describe('cleanListeners', () => {

        test('allows manual cleanup', () => {
            const mockTarget = {
                on: vi.fn(),
                off: vi.fn()
            }

            class TestManual extends PerkyComponent {}
            registerElement('test-manual', TestManual)

            const el = document.createElement('test-manual')
            el.listenTo(mockTarget, 'test', () => {})
            el.cleanListeners()

            expect(mockTarget.off).toHaveBeenCalled()
        })

    })


    describe('no styles', () => {

        test('works without static styles', () => {
            class NoStyles extends PerkyComponent {}
            registerElement('test-no-styles', NoStyles)

            const el = document.createElement('test-no-styles')
            document.body.appendChild(el)

            expect(el.shadowRoot.adoptedStyleSheets.length).toBe(0)

            document.body.removeChild(el)
        })

    })

})
