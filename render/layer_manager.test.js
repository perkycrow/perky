import {describe, test, expect, beforeEach, afterEach} from 'vitest'
import LayerManager from './layer_manager'
import PerkyModule from '../core/perky_module'
import CanvasLayer from './canvas_layer'
import HTMLLayer from './html_layer'


describe(LayerManager, () => {

    let manager
    let container

    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        manager = new LayerManager({
            container,
            width: 800,
            height: 600
        })
    })


    afterEach(() => {
        if (manager) {
            manager.dispose()
        }
        if (container && container.parentElement) {
            document.body.removeChild(container)
        }
    })


    test('constructor', () => {
        expect(manager).toBeInstanceOf(PerkyModule)
        expect(manager.$category).toBe('layerManager')
        expect(manager.container).toBe(container)
        expect(manager.width).toBe(800)
        expect(manager.height).toBe(600)
        expect(manager.childrenRegistry.size).toBe(0)
    })


    test('createLayer canvas', () => {
        const layer = manager.createLayer('game', 'canvas')

        expect(layer).toBeInstanceOf(CanvasLayer)
        expect(layer.$name).toBe('game')
        expect(manager.childrenRegistry.size).toBe(1)
        expect(container.contains(layer.canvas)).toBe(true)
    })


    test('createLayer html', () => {
        const layer = manager.createLayer('ui', 'html')

        expect(layer).toBeInstanceOf(HTMLLayer)
        expect(layer.$name).toBe('ui')
        expect(manager.childrenRegistry.size).toBe(1)
        expect(container.contains(layer.div)).toBe(true)
    })


    test('createLayer with existing name throws', () => {
        manager.createLayer('test', 'canvas')

        expect(() => {
            manager.createLayer('test', 'canvas')
        }).toThrow('Layer "test" already exists')
    })


    test('getLayer', () => {
        const layer = manager.createLayer('test', 'canvas')

        expect(manager.getLayer('test')).toBe(layer)
        expect(manager.getLayer('nonexistent')).toBeNull()
    })


    test('getCanvas', () => {
        const canvasLayer = manager.createLayer('game', 'canvas')
        manager.createLayer('ui', 'html')

        expect(manager.getCanvas('game')).toBe(canvasLayer)
        expect(() => manager.getCanvas('ui')).toThrow('is not a canvas layer')
    })


    test('getHTML', () => {
        manager.createLayer('game', 'canvas')
        const htmlLayer = manager.createLayer('ui', 'html')

        expect(manager.getHTML('ui')).toBe(htmlLayer)
        expect(() => manager.getHTML('game')).toThrow('is not an HTML layer')
    })


    test('removeLayer', () => {
        const layer = manager.createLayer('test', 'canvas')

        expect(manager.childrenRegistry.size).toBe(1)
        expect(layer.disposed).toBe(false)

        manager.removeLayer('test')

        expect(manager.childrenRegistry.size).toBe(0)
        expect(layer.disposed).toBe(true)
        expect(container.contains(layer.canvas)).toBe(false)
    })


    test('sortLayers by zIndex', () => {
        const layer1 = manager.createLayer('layer1', 'canvas', {zIndex: 20})
        const layer2 = manager.createLayer('layer2', 'canvas', {zIndex: 10})
        const layer3 = manager.createLayer('layer3', 'canvas', {zIndex: 30})

        manager.sortLayers()

        const children = Array.from(container.children)
        expect(children[0]).toBe(layer2.canvas)
        expect(children[1]).toBe(layer1.canvas)
        expect(children[2]).toBe(layer3.canvas)
    })


    test('resize', () => {
        manager.createLayer('test', 'canvas')

        manager.resize(1024, 768)

        expect(manager.width).toBe(1024)
        expect(manager.height).toBe(768)
        expect(container.style.width).toBe('1024px')
        expect(container.style.height).toBe('768px')
    })


    test('showLayer and hideLayer', () => {
        const layer = manager.createLayer('test', 'canvas')

        expect(layer.visible).toBe(true)

        manager.hideLayer('test')
        expect(layer.visible).toBe(false)

        manager.showLayer('test')
        expect(layer.visible).toBe(true)
    })


    test('markAllDirty', () => {
        const layer1 = manager.createLayer('layer1', 'canvas')
        const layer2 = manager.createLayer('layer2', 'canvas')

        layer1.markClean()
        layer2.markClean()

        manager.markAllDirty()

        expect(layer1.dirty).toBe(true)
        expect(layer2.dirty).toBe(true)
    })

})

