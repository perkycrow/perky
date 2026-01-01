import {describe, test, expect, beforeEach, vi} from 'vitest'
import RenderSystem from './render_system.js'
import PerkyView from '../application/perky_view.js'


describe('RenderSystem', () => {

    let container
    let renderSystem

    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)
        renderSystem = new RenderSystem({container})
    })


    describe('constructor', () => {

        test('creates RenderSystem instance with PerkyView', () => {
            expect(renderSystem).toBeInstanceOf(RenderSystem)
            expect(renderSystem.view).toBeInstanceOf(PerkyView)
        })


        test('sets layer dimensions from options', () => {
            const customRenderSystem = new RenderSystem({
                container,
                width: 1024,
                height: 768
            })

            expect(customRenderSystem.layerWidth).toBe(1024)
            expect(customRenderSystem.layerHeight).toBe(768)
        })


        test('has category renderSystem', () => {
            expect(renderSystem.$category).toBe('renderSystem')
        })

    })


    describe('layer management', () => {

        test('createLayer creates and returns canvas layer', () => {
            const layer = renderSystem.createLayer('test', 'canvas')

            expect(layer).toBeDefined()
            expect(renderSystem.getLayer('test')).toBe(layer)
        })


        test('getLayer retrieves layer by name', () => {
            renderSystem.createLayer('game', 'canvas')
            const layer = renderSystem.getLayer('game')

            expect(layer).toBeDefined()
            expect(layer.$id).toBe('game')
        })


        test('removeLayer removes layer', () => {
            renderSystem.createLayer('temp', 'canvas')
            expect(renderSystem.getLayer('temp')).toBeDefined()

            renderSystem.removeLayer('temp')
            expect(renderSystem.getLayer('temp')).toBeNull()
        })


        test('getCanvas retrieves canvas from layer', () => {
            renderSystem.createLayer('game', 'canvas')
            const canvas = renderSystem.getCanvas('game')

            expect(canvas).toBeDefined()
        })

    })


    describe('rendering', () => {

        beforeEach(() => {
            renderSystem.createLayer('game', 'canvas')
        })


        test('renderAll does not throw', () => {
            expect(() => renderSystem.renderAll()).not.toThrow()
        })


        test('renderLayer renders specific layer', () => {
            expect(() => renderSystem.renderLayer('game')).not.toThrow()
        })

    })


    describe('layer visibility', () => {

        beforeEach(() => {
            renderSystem.createLayer('ui', 'canvas')
        })


        test('showLayer calls setVisible with true', () => {
            const layer = renderSystem.getLayer('ui')
            const spy = vi.spyOn(layer, 'setVisible')

            renderSystem.showLayer('ui')

            expect(spy).toHaveBeenCalledWith(true)
        })


        test('hideLayer calls setVisible with false', () => {
            const layer = renderSystem.getLayer('ui')
            const spy = vi.spyOn(layer, 'setVisible')

            renderSystem.hideLayer('ui')

            expect(spy).toHaveBeenCalledWith(false)
        })

    })


    describe('camera management', () => {

        test('getCamera returns main camera by default', () => {
            const camera = renderSystem.getCamera()

            expect(camera).toBeDefined()
        })


        test('getCamera retrieves camera by id', () => {
            const camera = renderSystem.getCamera('main')

            expect(camera).toBeDefined()
        })


        test('setCamera creates camera with options', () => {
            const camera = renderSystem.setCamera('test', {unitsInView: 5})

            expect(renderSystem.getCamera('test')).toBe(camera)
            expect(camera.unitsInView).toEqual({height: 5})
        })


        test('createCamera creates camera with full options', () => {
            const camera = renderSystem.createCamera('secondary', {
                unitsInView: {width: 20},
                zoom: 2
            })

            expect(camera.$id).toBe('secondary')
            expect(camera.$category).toBe('camera')
            expect(camera.unitsInView).toEqual({width: 20})
            expect(camera.zoom).toBe(2)
            expect(renderSystem.getCamera('secondary')).toBe(camera)
        })


        test('setCamera replaces existing camera', () => {
            const first = renderSystem.setCamera('test', {zoom: 1})
            const second = renderSystem.setCamera('test', {zoom: 2})

            expect(renderSystem.getCamera('test')).toBe(second)
            expect(second.zoom).toBe(2)
            expect(first.disposed).toBe(true)
        })


        test('childrenByCategory lists all cameras', () => {
            renderSystem.createCamera('secondary', {})

            const cameras = renderSystem.childrenByCategory('camera')

            expect(cameras.length).toBe(2)
            expect(cameras.map(c => c.$id)).toContain('main')
            expect(cameras.map(c => c.$id)).toContain('secondary')
        })

    })


    describe('lifecycle', () => {

        test('dispose does not crash when called twice', () => {
            renderSystem.dispose()

            expect(() => {
                renderSystem.dispose()
            }).not.toThrow()
        })

    })


    describe('delegation', () => {

        test('install delegates methods to host', () => {
            const host = {
                on: vi.fn()
            }

            renderSystem.install(host)

            expect(host.createLayer).toBeDefined()
            expect(host.getLayer).toBeDefined()
            expect(host.renderAll).toBeDefined()
        })

    })

    describe('childrenByCategory', () => {

        test('returns only layers', () => {
            renderSystem.createLayer('layer1', 'canvas')
            renderSystem.createLayer('layer2', 'canvas')

            const layers = renderSystem.childrenByCategory('layer')

            expect(layers).toHaveLength(2)
            expect(layers.every(l => l.$category === 'layer')).toBe(true)
        })

    })

})
