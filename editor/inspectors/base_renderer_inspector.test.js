import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import BaseRendererInspector from './base_renderer_inspector.js'
import BaseRenderer from '../../render/base_renderer.js'


class MockRenderer extends BaseRenderer {

    constructor (options = {}) {
        super(options)
    }

}


describe('BaseRendererInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('base-renderer-inspector')
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


    describe('static matches', () => {

        test('matches BaseRenderer instance', () => {
            const renderer = new MockRenderer()
            expect(BaseRendererInspector.matches(renderer)).toBe(true)
        })


        test('does not match non-BaseRenderer', () => {
            expect(BaseRendererInspector.matches({})).toBe(false)
            expect(BaseRendererInspector.matches(null)).toBe(false)
            expect(BaseRendererInspector.matches('string')).toBe(false)
        })

    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockRenderer()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('displays canvas dimensions', () => {
            const module = new MockRenderer({width: 800, height: 600, pixelRatio: 2})
            module.applyPixelRatio()
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasCanvas = Array.from(values).some(v => v.textContent === '1600×1200')
            expect(hasCanvas).toBe(true)
        })


        test('displays display dimensions', () => {
            const module = new MockRenderer({width: 800, height: 600})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasDisplay = Array.from(values).some(v => v.textContent === '800×600')
            expect(hasDisplay).toBe(true)
        })

    })


    describe('pixelRatio slider', () => {

        test('creates slider for pixelRatio', () => {
            const module = new MockRenderer()
            inspector.setModule(module)

            const slider = inspector.gridEl.querySelector('slider-input')
            expect(slider).not.toBeNull()
        })


        test('slider has correct initial value', () => {
            const module = new MockRenderer({pixelRatio: 2})
            inspector.setModule(module)

            const slider = inspector.gridEl.querySelector('slider-input')
            expect(slider.value).toBe(2)
        })


        test('slider calls setPixelRatio on change', () => {
            const module = new MockRenderer()
            const setPixelRatioSpy = vi.spyOn(module, 'setPixelRatio')
            inspector.setModule(module)

            const slider = inspector.gridEl.querySelector('slider-input')
            slider.dispatchEvent(new CustomEvent('change', {detail: {value: 0.5}}))

            expect(setPixelRatioSpy).toHaveBeenCalledWith(0.5)
        })

    })

})
