import {describe, test, expect, beforeEach, afterEach} from 'vitest'
import WebGLCanvasInspector from './webgl_canvas_inspector.js'


class MockToggleInput extends HTMLElement {

    constructor () {
        super()
        this._checked = false
    }


    set checked (v) {
        this._checked = v
    }


    get checked () {
        return this._checked
    }

}


class MockSliderInput extends HTMLElement {

    constructor () {
        super()
        this._value = 0
    }


    set value (v) {
        this._value = v
    }


    get value () {
        return this._value
    }

}


if (!customElements.get('toggle-input')) {
    customElements.define('toggle-input', MockToggleInput)
}


if (!customElements.get('slider-input')) {
    customElements.define('slider-input', MockSliderInput)
}


class MockWebGLCanvas2D {

    constructor (options = {}) { // eslint-disable-line complexity -- clean
        this.canvas = {
            width: options.width || 800,
            height: options.height || 600
        }
        this.pixelRatio = options.pixelRatio || 1
        this.backgroundColor = options.backgroundColor || null
        this.enableCulling = options.enableCulling ?? false
        this.postProcessor = options.postProcessor || null
    }

}


describe('WebGLCanvasInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('webgl-canvas-inspector')
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
            expect(typeof WebGLCanvasInspector.matches).toBe('function')
        })

    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockWebGLCanvas2D()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('renders canvas info when module is set', () => {
            const module = new MockWebGLCanvas2D()
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            expect(labels.length).toBeGreaterThan(0)
        })

    })


    describe('rendering', () => {

        test('shows type as WebGL2', () => {
            const module = new MockWebGLCanvas2D()
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasType = Array.from(values).some(v => v.textContent === 'WebGL2')
            expect(hasType).toBe(true)
        })


        test('shows canvas dimensions', () => {
            const module = new MockWebGLCanvas2D({width: 1920, height: 1080})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasDimensions = Array.from(values).some(v => v.textContent === '1920×1080')
            expect(hasDimensions).toBe(true)
        })


        test('shows pixel ratio', () => {
            const module = new MockWebGLCanvas2D({pixelRatio: 2})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasRatio = Array.from(values).some(v => v.textContent === '2')
            expect(hasRatio).toBe(true)
        })


        test('shows background color', () => {
            const module = new MockWebGLCanvas2D({backgroundColor: '#000000'})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasColor = Array.from(values).some(v => v.textContent === '#000000')
            expect(hasColor).toBe(true)
        })


        test('shows transparent when no background color', () => {
            const module = new MockWebGLCanvas2D({backgroundColor: null})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasTransparent = Array.from(values).some(v => v.textContent === 'transparent')
            expect(hasTransparent).toBe(true)
        })


        test('shows culling enabled', () => {
            const module = new MockWebGLCanvas2D({enableCulling: true})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasCulling = Array.from(values).some(v => v.textContent === 'enabled')
            expect(hasCulling).toBe(true)
        })


        test('shows culling disabled', () => {
            const module = new MockWebGLCanvas2D({enableCulling: false})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasCulling = Array.from(values).some(v => v.textContent === 'disabled')
            expect(hasCulling).toBe(true)
        })

    })


    describe('post-processing', () => {

        test('does not render post-processing section when no postProcessor', () => {
            const module = new MockWebGLCanvas2D({postProcessor: null})
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            const hasPostProcessing = Array.from(labels).some(l => l.textContent === 'post-processing')
            expect(hasPostProcessing).toBe(false)
        })


        test('shows post-processing status', () => {
            const module = new MockWebGLCanvas2D({
                postProcessor: {enabled: true, passes: []}
            })
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            const hasPostProcessing = Array.from(labels).some(l => l.textContent === 'post-processing')
            expect(hasPostProcessing).toBe(true)
        })


        test('shows passes count', () => {
            const module = new MockWebGLCanvas2D({
                postProcessor: {
                    enabled: true,
                    passes: [
                        {enabled: true, constructor: {name: 'Pass1'}},
                        {enabled: true, constructor: {name: 'Pass2'}}
                    ]
                }
            })
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value.accent')
            const hasCount = Array.from(values).some(v => v.textContent === '2')
            expect(hasCount).toBe(true)
        })


        test('shows no passes message when empty', () => {
            const module = new MockWebGLCanvas2D({
                postProcessor: {enabled: true, passes: []}
            })
            inspector.setModule(module)

            const noPasses = inspector.gridEl.querySelector('.no-passes')
            expect(noPasses).not.toBeNull()
            expect(noPasses.textContent).toBe('No post-processing passes')
        })


        test('renders pass sections', () => {
            const module = new MockWebGLCanvas2D({
                postProcessor: {
                    enabled: true,
                    passes: [
                        {
                            enabled: true,
                            constructor: {name: 'BlurPass', defaultUniforms: {}},
                            uniforms: {}
                        }
                    ]
                }
            })
            inspector.setModule(module)

            const sections = inspector.gridEl.querySelectorAll('.pass-section')
            expect(sections.length).toBe(1)
        })

    })


    describe('clearContent', () => {

        test('clears and re-renders on module change', () => {
            const module1 = new MockWebGLCanvas2D({width: 800, height: 600})
            inspector.setModule(module1)

            const module2 = new MockWebGLCanvas2D({width: 1920, height: 1080})
            inspector.setModule(module2)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasNew = Array.from(values).some(v => v.textContent === '1920×1080')
            const hasOld = Array.from(values).some(v => v.textContent === '800×600')

            expect(hasNew).toBe(true)
            expect(hasOld).toBe(false)
        })

    })

})
