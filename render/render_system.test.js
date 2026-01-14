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


        test('getRenderer retrieves renderer from layer', () => {
            renderSystem.createLayer('game', 'canvas')
            const renderer = renderSystem.getRenderer('game')

            expect(renderer).toBeDefined()
            expect(renderer.constructor.name).toBe('CanvasRenderer')
        })


        test('getRenderer retrieves WebGLRenderer for webgl layer', () => {
            renderSystem.createLayer('game', 'webgl')
            const renderer = renderSystem.getRenderer('game')

            expect(renderer).toBeDefined()
            expect(renderer.constructor.name).toBe('WebGLRenderer')
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


    test('dispose does not crash when called twice', () => {
        renderSystem.dispose()

        expect(() => {
            renderSystem.dispose()
        }).not.toThrow()
    })


    test('install delegates methods to host', () => {
        const host = {
            on: vi.fn()
        }

        renderSystem.install(host)

        expect(host.createLayer).toBeDefined()
        expect(host.getLayer).toBeDefined()
        expect(host.renderAll).toBeDefined()
    })


    test('childrenByCategory returns only layers', () => {
        renderSystem.createLayer('layer1', 'canvas')
        renderSystem.createLayer('layer2', 'canvas')

        const layers = renderSystem.childrenByCategory('layer')

        expect(layers).toHaveLength(2)
        expect(layers.every(l => l.$category === 'layer')).toBe(true)
    })


    test('mount mounts view to container', () => {
        const newContainer = document.createElement('div')

        renderSystem.mount(newContainer)

        expect(renderSystem.mounted).toBe(true)
        expect(renderSystem.container).toBe(newContainer)
    })


    test('dismount unmounts view from container', () => {
        renderSystem.dismount()

        expect(renderSystem.mounted).toBe(false)
    })


    test('setupCameras creates main camera by default', () => {
        const rs = new RenderSystem()

        const camera = rs.getCamera('main')

        expect(camera).toBeDefined()
        expect(camera.$category).toBe('camera')
    })


    test('setupCameras with config creates additional cameras', () => {
        const rs = new RenderSystem({
            cameras: {
                main: {unitsInView: 5},
                secondary: {unitsInView: 10}
            }
        })

        expect(rs.getCamera('main').unitsInView).toEqual({height: 5})
        expect(rs.getCamera('secondary').unitsInView).toEqual({height: 10})
    })


    test('resolveCamera with string returns camera', () => {
        const camera = renderSystem.resolveCamera('main')

        expect(camera).toBe(renderSystem.getCamera('main'))
    })


    test('resolveCamera with Camera returns same camera', () => {
        const existing = renderSystem.getCamera('main')

        const resolved = renderSystem.resolveCamera(existing)

        expect(resolved).toBe(existing)
    })


    test('resolveCamera with null returns null', () => {
        const resolved = renderSystem.resolveCamera(null)

        expect(resolved).toBeNull()
    })


    test('getHTML returns element from any layer', () => {
        renderSystem.createLayer('canvasLayer', 'canvas')
        renderSystem.createLayer('htmlLayer', 'html')

        const canvasElement = renderSystem.getHTML('canvasLayer')
        const htmlElement = renderSystem.getHTML('htmlLayer')

        expect(canvasElement).toBeInstanceOf(HTMLCanvasElement)
        expect(htmlElement).toBeInstanceOf(HTMLDivElement)
    })


    test('sortLayers reorders layers by zIndex in DOM', () => {
        renderSystem.createLayer('low', 'canvas', {zIndex: 1})
        renderSystem.createLayer('high', 'canvas', {zIndex: 10})
        renderSystem.createLayer('mid', 'canvas', {zIndex: 5})

        const result = renderSystem.sortLayers()

        expect(result).toBe(renderSystem)

        const elements = Array.from(renderSystem.element.children)
        const zIndexes = elements.map(el => {
            const layer = renderSystem.childrenByCategory('layer').find(l => l.element === el)
            return layer?.zIndex
        }).filter(z => z !== undefined)

        expect(zIndexes).toEqual([1, 5, 10])
    })


    test('resize updates layer dimensions and cameras', () => {
        renderSystem.createLayer('game', 'canvas')
        const camera = renderSystem.getCamera('main')

        renderSystem.resize(1920, 1080)

        expect(renderSystem.layerWidth).toBe(1920)
        expect(renderSystem.layerHeight).toBe(1080)
        expect(camera.viewportWidth).toBe(1920)
        expect(camera.viewportHeight).toBe(1080)
    })


    test('resizeToContainer uses element dimensions', () => {
        Object.defineProperty(renderSystem.element, 'clientWidth', {value: 1024, writable: true})
        Object.defineProperty(renderSystem.element, 'clientHeight', {value: 768, writable: true})

        renderSystem.resizeToContainer()

        expect(renderSystem.layerWidth).toBe(1024)
        expect(renderSystem.layerHeight).toBe(768)
    })


    test('enableAutoResize enables auto resize', () => {
        renderSystem.autoResizeEnabled = false

        const result = renderSystem.enableAutoResize()

        expect(renderSystem.autoResizeEnabled).toBe(true)
        expect(result).toBe(renderSystem)
    })


    test('disableAutoResize disables auto resize', () => {
        renderSystem.autoResizeEnabled = true

        const result = renderSystem.disableAutoResize()

        expect(renderSystem.autoResizeEnabled).toBe(false)
        expect(result).toBe(renderSystem)
    })


    test('markAllDirty marks all layers dirty', () => {
        renderSystem.createLayer('layer1', 'canvas')
        renderSystem.createLayer('layer2', 'canvas')

        const layer1 = renderSystem.getLayer('layer1')
        const layer2 = renderSystem.getLayer('layer2')

        layer1.markClean()
        layer2.markClean()

        expect(layer1.dirty).toBe(false)
        expect(layer2.dirty).toBe(false)

        renderSystem.markAllDirty()

        expect(layer1.dirty).toBe(true)
        expect(layer2.dirty).toBe(true)
    })

})
