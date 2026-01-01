import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import CanvasLayerInspector from './canvas_layer_inspector.js'


class MockCanvasLayer {

    constructor (options = {}) { // eslint-disable-line complexity -- clean
        this.rendererType = options.rendererType || '2d'
        this.zIndex = options.zIndex ?? 0
        this.visible = options.visible ?? true
        this.opacity = options.opacity ?? 1
        this.autoRender = options.autoRender ?? true
        this.renderer = options.renderer || null
        this.content = options.content || null
    }

}


describe('CanvasLayerInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('canvas-layer-inspector')
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


        test('has gridEl after buildDOM', () => {
            expect(inspector.gridEl).not.toBeNull()
        })

    })


    describe('matches', () => {

        test('static matches method exists', () => {
            expect(typeof CanvasLayerInspector.matches).toBe('function')
        })

    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockCanvasLayer()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('renders layer info when module is set', () => {
            const module = new MockCanvasLayer({
                rendererType: 'webgl',
                zIndex: 5
            })
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            expect(labels.length).toBeGreaterThan(0)
        })

    })


    describe('rendering', () => {

        test('shows rendererType', () => {
            const module = new MockCanvasLayer({rendererType: 'webgl'})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasWebgl = Array.from(values).some(v => v.textContent === 'webgl')
            expect(hasWebgl).toBe(true)
        })


        test('shows zIndex', () => {
            const module = new MockCanvasLayer({zIndex: 10})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasZIndex = Array.from(values).some(v => v.textContent === '10')
            expect(hasZIndex).toBe(true)
        })


        test('shows visible as yes/no', () => {
            const module = new MockCanvasLayer({visible: true})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasYes = Array.from(values).some(v => v.textContent === 'yes')
            expect(hasYes).toBe(true)
        })


        test('shows visible no when false', () => {
            const module = new MockCanvasLayer({visible: false})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasNo = Array.from(values).some(v => v.textContent === 'no')
            expect(hasNo).toBe(true)
        })


        test('shows opacity', () => {
            const module = new MockCanvasLayer({opacity: 0.5})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasOpacity = Array.from(values).some(v => v.textContent === '0.5')
            expect(hasOpacity).toBe(true)
        })


        test('shows renderer constructor name when present', () => {
            class TestRenderer {}
            const module = new MockCanvasLayer({renderer: new TestRenderer()})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasRenderer = Array.from(values).some(v => v.textContent === 'TestRenderer')
            expect(hasRenderer).toBe(true)
        })


        test('shows content info when present', () => {
            class TestContent {
                constructor () {
                    this.children = [{}, {}, {}]
                }
            }
            const module = new MockCanvasLayer({content: new TestContent()})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value.accent')
            const hasContent = Array.from(values).some(v => v.textContent.includes('TestContent'))
            expect(hasContent).toBe(true)
        })


        test('shows content as none when not present', () => {
            const module = new MockCanvasLayer({content: null})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasNone = Array.from(values).some(v => v.textContent === '(none)')
            expect(hasNone).toBe(true)
        })

    })


    describe('scene tree button', () => {

        test('shows Scene Tree button when content exists', () => {
            class TestContent {
                constructor () {
                    this.children = []
                }
            }
            const module = new MockCanvasLayer({content: new TestContent()})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn).not.toBeNull()
            expect(btn.textContent).toContain('Scene Tree')
        })


        test('does not show Scene Tree button when no content', () => {
            const module = new MockCanvasLayer({content: null})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn).toBeNull()
        })


        test('dispatches open:scene-tree event when clicked', () => {
            class TestContent {
                constructor () {
                    this.children = []
                }
            }
            const content = new TestContent()
            const module = new MockCanvasLayer({content})
            inspector.setModule(module)

            const eventHandler = vi.fn()
            inspector.addEventListener('open:scene-tree', eventHandler)

            const btn = inspector.actionsEl.querySelector('button')
            btn.click()

            expect(eventHandler).toHaveBeenCalled()
            expect(eventHandler.mock.calls[0][0].detail.content).toBe(content)
        })

    })

})
