import {describe, it, expect, beforeEach} from 'vitest'
import BaseRenderer from './base_renderer'


describe('BaseRenderer', () => {

    let container
    let renderer

    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)
        renderer = new BaseRenderer({container})
    })


    describe('constructor', () => {

        it('should create a BaseRenderer instance', () => {
            expect(renderer).toBeInstanceOf(BaseRenderer)
        })


        it('should create a canvas element', () => {
            expect(renderer.canvas).toBeInstanceOf(HTMLCanvasElement)
        })


        it('should use provided canvas', () => {
            const customCanvas = document.createElement('canvas')
            const r = new BaseRenderer({canvas: customCanvas})
            expect(r.canvas).toBe(customCanvas)
        })


        it('should set default dimensions', () => {
            expect(renderer.displayWidth).toBeDefined()
            expect(renderer.displayHeight).toBeDefined()
        })


        it('should set custom dimensions', () => {
            const r = new BaseRenderer({width: 1024, height: 768})
            expect(r.displayWidth).toBe(1024)
            expect(r.displayHeight).toBe(768)
        })


        it('should have category renderer', () => {
            expect(renderer.$category).toBe('renderer')
        })


        it('should create default camera', () => {
            expect(renderer.camera).toBeDefined()
        })

    })


    describe('container', () => {

        it('should get container from canvas parent', () => {
            expect(renderer.container).toBe(container)
        })


        it('should set container and append canvas', () => {
            const newContainer = document.createElement('div')
            renderer.container = newContainer
            expect(renderer.canvas.parentElement).toBe(newContainer)
        })

    })


    describe('autoFitEnabled', () => {

        it('should be disabled by default', () => {
            expect(renderer.autoFitEnabled).toBe(false)
        })


        it('should enable autoFit', () => {
            renderer.autoFitEnabled = true
            expect(renderer.autoFitEnabled).toBe(true)
        })


        it('should disable autoFit', () => {
            renderer.autoFitEnabled = true
            renderer.autoFitEnabled = false
            expect(renderer.autoFitEnabled).toBe(false)
        })


        it('should be enabled via option', () => {
            const r = new BaseRenderer({autoFit: true, container})
            expect(r.autoFitEnabled).toBe(true)
        })

    })


    describe('pixelRatio', () => {

        it('should default to 1', () => {
            expect(renderer.pixelRatio).toBe(1)
        })


        it('should set custom pixelRatio', () => {
            const r = new BaseRenderer({pixelRatio: 2})
            expect(r.pixelRatio).toBe(2)
        })


        it('should apply pixelRatio to canvas dimensions', () => {
            renderer.displayWidth = 100
            renderer.displayHeight = 100
            renderer.pixelRatio = 2
            renderer.applyPixelRatio()

            expect(renderer.canvas.width).toBe(200)
            expect(renderer.canvas.height).toBe(200)
        })


        it('should set pixelRatio via setPixelRatio', () => {
            renderer.setPixelRatio(3)
            expect(renderer.pixelRatio).toBe(3)
        })


        it('should return this from setPixelRatio', () => {
            expect(renderer.setPixelRatio(2)).toBe(renderer)
        })

    })


    describe('resize', () => {

        it('should update display dimensions', () => {
            renderer.resize(500, 400)
            expect(renderer.displayWidth).toBe(500)
            expect(renderer.displayHeight).toBe(400)
        })


        it('should update canvas style', () => {
            renderer.resize(500, 400)
            expect(renderer.canvas.style.width).toBe('500px')
            expect(renderer.canvas.style.height).toBe('400px')
        })


        it('should return this', () => {
            expect(renderer.resize(100, 100)).toBe(renderer)
        })

    })


    describe('resizeToContainer', () => {

        it('should return this', () => {
            expect(renderer.resizeToContainer()).toBe(renderer)
        })


        it('should not throw without container', () => {
            const r = new BaseRenderer({})
            expect(() => r.resizeToContainer()).not.toThrow()
        })

    })


    describe('dispose', () => {

        it('should set canvas to null', () => {
            renderer.dispose()
            expect(renderer.canvas).toBeNull()
        })


        it('should set camera to null', () => {
            renderer.dispose()
            expect(renderer.camera).toBeNull()
        })


        it('should remove canvas from DOM', () => {
            renderer.dispose()
            expect(container.children.length).toBe(0)
        })

    })

})
