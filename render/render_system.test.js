import {describe, it, expect, beforeEach, vi} from 'vitest'
import RenderSystem from './render_system'
import PerkyView from '../application/perky_view'


describe('RenderSystem', () => {

    let container
    let renderSystem

    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)
        renderSystem = new RenderSystem({container})
    })


    describe('constructor', () => {

        it('should create a RenderSystem instance', () => {
            expect(renderSystem).toBeInstanceOf(RenderSystem)
            expect(renderSystem.view).toBeInstanceOf(PerkyView)
        })


        it('should set layer dimensions from options', () => {
            const customRenderSystem = new RenderSystem({
                container,
                width: 1024,
                height: 768
            })

            expect(customRenderSystem.layerWidth).toBe(1024)
            expect(customRenderSystem.layerHeight).toBe(768)
        })


        it('should have category renderSystem', () => {
            expect(renderSystem.$category).toBe('renderSystem')
        })

    })


    describe('layer management', () => {

        it('should create a canvas layer', () => {
            const layer = renderSystem.createLayer('test', 'canvas')

            expect(layer).toBeDefined()
            expect(renderSystem.getLayer('test')).toBe(layer)
        })


        it('should get a layer by name', () => {
            renderSystem.createLayer('game', 'canvas')
            const layer = renderSystem.getLayer('game')

            expect(layer).toBeDefined()
            expect(layer.$id).toBe('game')
        })


        it('should remove a layer', () => {
            renderSystem.createLayer('temp', 'canvas')
            expect(renderSystem.getLayer('temp')).toBeDefined()

            renderSystem.removeLayer('temp')
            expect(renderSystem.getLayer('temp')).toBeNull()
        })


        it('should get canvas layer', () => {
            renderSystem.createLayer('game', 'canvas')
            const canvas = renderSystem.getCanvas('game')

            expect(canvas).toBeDefined()
        })

    })


    describe('rendering', () => {

        beforeEach(() => {
            renderSystem.createLayer('game', 'canvas')
        })


        it('should render all layers', () => {
            expect(() => renderSystem.renderAll()).not.toThrow()
        })


        it('should render a specific layer', () => {
            expect(() => renderSystem.renderLayer('game')).not.toThrow()
        })

    })


    describe('layer visibility', () => {

        beforeEach(() => {
            renderSystem.createLayer('ui', 'canvas')
        })


        it('should show a layer', () => {
            const layer = renderSystem.getLayer('ui')
            const spy = vi.spyOn(layer, 'setVisible')

            renderSystem.showLayer('ui')

            expect(spy).toHaveBeenCalledWith(true)
        })


        it('should hide a layer', () => {
            const layer = renderSystem.getLayer('ui')
            const spy = vi.spyOn(layer, 'setVisible')

            renderSystem.hideLayer('ui')

            expect(spy).toHaveBeenCalledWith(false)
        })

    })


    describe('camera management', () => {

        it('should get main camera by default', () => {
            const camera = renderSystem.getCamera()

            expect(camera).toBeDefined()
        })


        it('should get camera by id', () => {
            const camera = renderSystem.getCamera('main')

            expect(camera).toBeDefined()
        })


        it('should set a camera', () => {
            const camera = renderSystem.setCamera('test', {unitsInView: 5})

            expect(renderSystem.getCamera('test')).toBe(camera)
            expect(camera.unitsInView).toEqual({height: 5})
        })


        it('should create a camera with createCamera', () => {
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


        it('should replace existing camera with setCamera', () => {
            const first = renderSystem.setCamera('test', {zoom: 1})
            const second = renderSystem.setCamera('test', {zoom: 2})

            expect(renderSystem.getCamera('test')).toBe(second)
            expect(second.zoom).toBe(2)
            expect(first.disposed).toBe(true)
        })


        it('should list cameras by category', () => {
            renderSystem.createCamera('secondary', {})

            const cameras = renderSystem.childrenByCategory('camera')

            expect(cameras.length).toBe(2)
            expect(cameras.map(c => c.$id)).toContain('main')
            expect(cameras.map(c => c.$id)).toContain('secondary')
        })

    })


    describe('lifecycle', () => {

        it('should not crash if disposed twice', () => {
            renderSystem.dispose()

            expect(() => {
                renderSystem.dispose()
            }).not.toThrow()
        })

    })


    describe('delegation', () => {

        it('should delegate methods to host on install', () => {
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

        it('should return only layers', () => {
            renderSystem.createLayer('layer1', 'canvas')
            renderSystem.createLayer('layer2', 'canvas')

            const layers = renderSystem.childrenByCategory('layer')

            expect(layers).toHaveLength(2)
            expect(layers.every(l => l.$category === 'layer')).toBe(true)
        })

    })

})
