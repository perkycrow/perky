import {describe, test, expect, beforeEach, afterEach} from 'vitest'
import RenderGroupInspector from './render_group_inspector.js'


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


class MockRenderGroup {

    constructor (options = {}) { // eslint-disable-line complexity -- clean
        this.$name = options.name || 'main'
        this.visible = options.visible ?? true
        this.started = options.started ?? false
        this.opacity = options.opacity ?? 1
        this.blendMode = options.blendMode || 'normal'
        this.content = options.content || null
        this.renderTransform = options.renderTransform || null
        this.postPasses = options.postPasses || []
    }

}


describe('RenderGroupInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('render-group-inspector')
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
            expect(typeof RenderGroupInspector.matches).toBe('function')
        })

    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockRenderGroup()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('renders group info when module is set', () => {
            const module = new MockRenderGroup()
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            expect(labels.length).toBeGreaterThan(0)
        })

    })


    describe('rendering', () => {

        test('shows visible toggle', () => {
            const module = new MockRenderGroup({visible: true})
            inspector.setModule(module)

            const toggle = inspector.gridEl.querySelector('toggle-input')
            expect(toggle).not.toBeNull()
            expect(toggle.checked).toBe(true)
        })


        test('updates visible on toggle change', () => {
            const module = new MockRenderGroup({visible: true})
            inspector.setModule(module)

            const toggle = inspector.gridEl.querySelector('toggle-input')
            toggle.dispatchEvent(new CustomEvent('change', {detail: {checked: false}}))

            expect(module.visible).toBe(false)
        })


        test('shows name', () => {
            const module = new MockRenderGroup({name: 'background'})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasName = Array.from(values).some(v => v.textContent === 'background')
            expect(hasName).toBe(true)
        })


        test('shows status started/stopped', () => {
            const module = new MockRenderGroup({started: true})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'started')
            expect(hasStatus).toBe(true)
        })


        test('shows opacity slider', () => {
            const module = new MockRenderGroup({opacity: 0.8})
            inspector.setModule(module)

            const sliders = inspector.gridEl.querySelectorAll('slider-input')
            expect(sliders.length).toBeGreaterThan(0)
        })


        test('updates opacity on slider change', () => {
            const module = new MockRenderGroup({opacity: 1})
            inspector.setModule(module)

            const slider = inspector.gridEl.querySelector('slider-input')
            slider.dispatchEvent(new CustomEvent('change', {detail: {value: 0.5}}))

            expect(module.opacity).toBe(0.5)
        })

    })


    describe('blend mode selector', () => {

        test('shows blend mode selector', () => {
            const module = new MockRenderGroup()
            inspector.setModule(module)

            const select = inspector.gridEl.querySelector('select')
            expect(select).not.toBeNull()
        })


        test('has normal, additive, multiply options', () => {
            const module = new MockRenderGroup()
            inspector.setModule(module)

            const options = inspector.gridEl.querySelectorAll('select option')
            const values = Array.from(options).map(o => o.value)

            expect(values).toContain('normal')
            expect(values).toContain('additive')
            expect(values).toContain('multiply')
        })


        test('selects current blend mode', () => {
            const module = new MockRenderGroup({blendMode: 'additive'})
            inspector.setModule(module)

            const select = inspector.gridEl.querySelector('select')
            expect(select.value).toBe('additive')
        })


        test('updates blend mode on select change', () => {
            const module = new MockRenderGroup({blendMode: 'normal'})
            inspector.setModule(module)

            const select = inspector.gridEl.querySelector('select')
            select.value = 'multiply'
            select.dispatchEvent(new Event('change'))

            expect(module.blendMode).toBe('multiply')
        })

    })


    describe('content display', () => {

        test('shows content name when present', () => {
            const content = {name: 'MainScene', children: []}
            const module = new MockRenderGroup({content})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasContent = Array.from(values).some(v => v.textContent === 'MainScene')
            expect(hasContent).toBe(true)
        })


        test('shows content constructor name as fallback', () => {
            class TestContent {
                constructor () {
                    this.children = []
                }
            }
            const module = new MockRenderGroup({content: new TestContent()})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasContent = Array.from(values).some(v => v.textContent === 'TestContent')
            expect(hasContent).toBe(true)
        })


        test('shows none when no content', () => {
            const module = new MockRenderGroup({content: null})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasNone = Array.from(values).some(v => v.textContent === 'none')
            expect(hasNone).toBe(true)
        })


        test('shows children count', () => {
            const content = {name: 'Scene', children: [{}, {}, {}]}
            const module = new MockRenderGroup({content})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasCount = Array.from(values).some(v => v.textContent === '3')
            expect(hasCount).toBe(true)
        })

    })


    describe('post-processing passes', () => {

        test('shows post-passes count', () => {
            const passes = [{enabled: true, constructor: {name: 'Blur'}}]
            const module = new MockRenderGroup({postPasses: passes})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value.accent')
            const hasCount = Array.from(values).some(v => v.textContent === '1')
            expect(hasCount).toBe(true)
        })


        test('shows no passes message when empty', () => {
            const module = new MockRenderGroup({postPasses: []})
            inspector.setModule(module)

            const noPasses = inspector.gridEl.querySelector('.no-passes')
            expect(noPasses).not.toBeNull()
            expect(noPasses.textContent).toBe('No post-processing passes')
        })


        test('renders pass sections', () => {
            const passes = [
                {
                    enabled: true,
                    constructor: {name: 'BlurPass', defaultUniforms: {}},
                    uniforms: {}
                }
            ]
            const module = new MockRenderGroup({postPasses: passes})
            inspector.setModule(module)

            const sections = inspector.gridEl.querySelectorAll('.pass-section')
            expect(sections.length).toBe(1)
        })

    })

})
