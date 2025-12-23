import {describe, it, expect, beforeEach, vi} from 'vitest'
import RenderSystem from './render_system'
import LayerManager from './layer_manager'


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
        })


        it('should create a default LayerManager', () => {
            expect(renderSystem.layerManager).toBeInstanceOf(LayerManager)
        })


        it('should pass options to LayerManager', () => {
            const customRenderSystem = new RenderSystem({
                container,
                width: 1024,
                height: 768
            })

            expect(customRenderSystem.layerManager.width).toBe(1024)
            expect(customRenderSystem.layerManager.height).toBe(768)
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
            expect(layer.$name).toBe('game')
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
            const spy = vi.spyOn(renderSystem.layerManager, 'renderAll')
            renderSystem.renderAll()

            expect(spy).toHaveBeenCalled()
        })


        it('should render a specific layer', () => {
            const spy = vi.spyOn(renderSystem.layerManager, 'renderLayer')
            renderSystem.renderLayer('game')

            expect(spy).toHaveBeenCalledWith('game')
        })

    })


    describe('layer visibility', () => {

        beforeEach(() => {
            renderSystem.createLayer('ui', 'canvas')
        })


        it('should show a layer', () => {
            const spy = vi.spyOn(renderSystem.layerManager, 'showLayer')
            renderSystem.showLayer('ui')

            expect(spy).toHaveBeenCalledWith('ui')
        })


        it('should hide a layer', () => {
            const spy = vi.spyOn(renderSystem.layerManager, 'hideLayer')
            renderSystem.hideLayer('ui')

            expect(spy).toHaveBeenCalledWith('ui')
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
            const spy = vi.spyOn(renderSystem.layerManager, 'setCamera')
            const mockCamera = {id: 'test'}

            renderSystem.setCamera('test', mockCamera)

            expect(spy).toHaveBeenCalledWith('test', mockCamera)
        })

    })


    describe('lifecycle', () => {

        it('should dispose the LayerManager on dispose', () => {
            const spy = vi.spyOn(renderSystem.layerManager, 'dispose')

            const layerManager = renderSystem.layerManager
            renderSystem.dispose()

            expect(spy).toHaveBeenCalled()
            expect(layerManager.disposed).toBe(true)
        })


        it('should not crash if disposed twice', () => {
            renderSystem.dispose()

            expect(() => { // eslint-disable-line max-nested-callbacks
                renderSystem.dispose()
            }).not.toThrow()
        })

    })


    describe('delegation', () => {

        it('should delegate methods to host on install', () => {
            const host = {
                delegate: vi.fn()
            }

            renderSystem.install(host)

            expect(host.delegate).toHaveBeenCalled()
        })

    })

})
