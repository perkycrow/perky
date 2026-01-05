import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import BaseRendererInspector from './base_renderer_inspector.js'


class MockRenderer {

    constructor (options = {}) {
        this.canvas = {
            width: options.canvasWidth ?? 800,
            height: options.canvasHeight ?? 600
        }
        this.displayWidth = options.displayWidth ?? 800
        this.displayHeight = options.displayHeight ?? 600
        this.pixelRatio = options.pixelRatio ?? 1
    }


    setPixelRatio (ratio) {
        this.pixelRatio = ratio
        this.canvas.width = this.displayWidth * ratio
        this.canvas.height = this.displayHeight * ratio
        return this
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


    test('static matches method exists', () => {
        expect(typeof BaseRendererInspector.matches).toBe('function')
    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockRenderer()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('displays canvas dimensions', () => {
            const module = new MockRenderer({canvasWidth: 1600, canvasHeight: 1200})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasCanvas = Array.from(values).some(v => v.textContent === '1600×1200')
            expect(hasCanvas).toBe(true)
        })


        test('displays display dimensions', () => {
            const module = new MockRenderer({displayWidth: 800, displayHeight: 600})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasDisplay = Array.from(values).some(v => v.textContent === '800×600')
            expect(hasDisplay).toBe(true)
        })

    })


    describe('pixelRatio slider', () => {

        test('creates slider for pixelRatio', () => {
            const module = new MockRenderer({pixelRatio: 1})
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
            const module = new MockRenderer({pixelRatio: 1})
            module.setPixelRatio = vi.fn()
            inspector.setModule(module)

            const slider = inspector.gridEl.querySelector('slider-input')
            slider.dispatchEvent(new CustomEvent('change', {detail: {value: 0.5}}))

            expect(module.setPixelRatio).toHaveBeenCalledWith(0.5)
        })

    })

})
