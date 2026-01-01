import {describe, test, expect, beforeEach} from 'vitest'
import BaseRenderer from './base_renderer.js'


describe('BaseRenderer', () => {

    let container
    let renderer

    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)
        renderer = new BaseRenderer({container})
    })


    describe('constructor', () => {

        test('creates BaseRenderer instance', () => {
            expect(renderer).toBeInstanceOf(BaseRenderer)
        })


        test('creates canvas element', () => {
            expect(renderer.canvas).toBeInstanceOf(HTMLCanvasElement)
        })


        test('uses provided canvas', () => {
            const customCanvas = document.createElement('canvas')
            const r = new BaseRenderer({canvas: customCanvas})
            expect(r.canvas).toBe(customCanvas)
        })


        test('sets default dimensions', () => {
            expect(renderer.displayWidth).toBeDefined()
            expect(renderer.displayHeight).toBeDefined()
        })


        test('sets custom dimensions', () => {
            const r = new BaseRenderer({width: 1024, height: 768})
            expect(r.displayWidth).toBe(1024)
            expect(r.displayHeight).toBe(768)
        })


        test('has category renderer', () => {
            expect(renderer.$category).toBe('renderer')
        })


        test('creates default camera', () => {
            expect(renderer.camera).toBeDefined()
        })

    })


    describe('container', () => {

        test('gets container from canvas parent', () => {
            expect(renderer.container).toBe(container)
        })


        test('sets container and appends canvas', () => {
            const newContainer = document.createElement('div')
            renderer.container = newContainer
            expect(renderer.canvas.parentElement).toBe(newContainer)
        })

    })


    describe('autoFitEnabled', () => {

        test('disabled by default', () => {
            expect(renderer.autoFitEnabled).toBe(false)
        })


        test('enables autoFit', () => {
            renderer.autoFitEnabled = true
            expect(renderer.autoFitEnabled).toBe(true)
        })


        test('disables autoFit', () => {
            renderer.autoFitEnabled = true
            renderer.autoFitEnabled = false
            expect(renderer.autoFitEnabled).toBe(false)
        })


        test('enabled via option', () => {
            const r = new BaseRenderer({autoFit: true, container})
            expect(r.autoFitEnabled).toBe(true)
        })

    })


    describe('pixelRatio', () => {

        test('defaults to 1', () => {
            expect(renderer.pixelRatio).toBe(1)
        })


        test('sets custom pixelRatio', () => {
            const r = new BaseRenderer({pixelRatio: 2})
            expect(r.pixelRatio).toBe(2)
        })


        test('applyPixelRatio scales canvas dimensions', () => {
            renderer.displayWidth = 100
            renderer.displayHeight = 100
            renderer.pixelRatio = 2
            renderer.applyPixelRatio()

            expect(renderer.canvas.width).toBe(200)
            expect(renderer.canvas.height).toBe(200)
        })


        test('setPixelRatio updates pixelRatio', () => {
            renderer.setPixelRatio(3)
            expect(renderer.pixelRatio).toBe(3)
        })


        test('setPixelRatio returns this', () => {
            expect(renderer.setPixelRatio(2)).toBe(renderer)
        })

    })


    describe('resize', () => {

        test('updates display dimensions', () => {
            renderer.resize(500, 400)
            expect(renderer.displayWidth).toBe(500)
            expect(renderer.displayHeight).toBe(400)
        })


        test('updates canvas style', () => {
            renderer.resize(500, 400)
            expect(renderer.canvas.style.width).toBe('500px')
            expect(renderer.canvas.style.height).toBe('400px')
        })


        test('returns this', () => {
            expect(renderer.resize(100, 100)).toBe(renderer)
        })

    })


    describe('resizeToContainer', () => {

        test('returns this', () => {
            expect(renderer.resizeToContainer()).toBe(renderer)
        })


        test('does not throw without container', () => {
            const r = new BaseRenderer({})
            expect(() => r.resizeToContainer()).not.toThrow()
        })

    })


    describe('dispose', () => {

        test('sets canvas to null', () => {
            renderer.dispose()
            expect(renderer.canvas).toBeNull()
        })


        test('sets camera to null', () => {
            renderer.dispose()
            expect(renderer.camera).toBeNull()
        })


        test('removes canvas from DOM', () => {
            renderer.dispose()
            expect(container.children.length).toBe(0)
        })

    })

})
