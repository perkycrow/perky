import {describe, test, expect, beforeEach} from 'vitest'
import Layer from './layer'


describe(Layer, () => {

    let layer

    beforeEach(() => {
        layer = new Layer({$id: 'test-layer'})
    })


    test('constructor defaults', () => {
        expect(layer.$id).toBe('test-layer')
        expect(layer.zIndex).toBe(0)
        expect(layer.visible).toBe(true)
        expect(layer.opacity).toBe(1)
        expect(layer.pointerEvents).toBe('auto')
        expect(layer.dirty).toBe(true)
        expect(layer.element).toBe(null)
        expect(layer.container).toBe(null)
    })


    test('constructor with options', () => {
        const l = new Layer({
            $id: 'custom',
            zIndex: 10,
            visible: false,
            opacity: 0.5,
            pointerEvents: 'none'
        })

        expect(l.$id).toBe('custom')
        expect(l.zIndex).toBe(10)
        expect(l.visible).toBe(false)
        expect(l.opacity).toBe(0.5)
        expect(l.pointerEvents).toBe('none')
    })


    test('viewport defaults', () => {
        expect(layer.viewport.x).toBe(0)
        expect(layer.viewport.y).toBe(0)
        expect(layer.viewport.width).toBe('100%')
        expect(layer.viewport.height).toBe('100%')
        expect(layer.viewport.anchor).toBe('top-left')
    })


    test('viewport with custom options', () => {
        const l = new Layer({
            $id: 'test',
            viewport: {
                x: 10,
                y: 20,
                width: 200,
                height: 150,
                anchor: 'top-right'
            }
        })

        expect(l.viewport.x).toBe(10)
        expect(l.viewport.y).toBe(20)
        expect(l.viewport.width).toBe(200)
        expect(l.viewport.height).toBe(150)
        expect(l.viewport.anchor).toBe('top-right')
    })


    test('calculateViewport with percentage width/height', () => {
        layer.viewport = {x: 0, y: 0, width: '50%', height: '75%', anchor: 'top-left'}

        const vp = layer.calculateViewport(800, 600)

        expect(vp.x).toBe(0)
        expect(vp.y).toBe(0)
        expect(vp.width).toBe(400) // 50% of 800
        expect(vp.height).toBe(450) // 75% of 600
    })


    test('calculateViewport with pixel values', () => {
        layer.viewport = {x: 10, y: 20, width: 200, height: 150, anchor: 'top-left'}

        const vp = layer.calculateViewport(800, 600)

        expect(vp.x).toBe(10)
        expect(vp.y).toBe(20)
        expect(vp.width).toBe(200)
        expect(vp.height).toBe(150)
    })


    test('calculateViewport with top-right anchor', () => {
        layer.viewport = {x: 10, y: 20, width: 200, height: 150, anchor: 'top-right'}

        const vp = layer.calculateViewport(800, 600)

        expect(vp.x).toBe(590) // 800 - 200 - 10
        expect(vp.y).toBe(20)
        expect(vp.width).toBe(200)
        expect(vp.height).toBe(150)
    })


    test('calculateViewport with bottom-left anchor', () => {
        layer.viewport = {x: 10, y: 20, width: 200, height: 150, anchor: 'bottom-left'}

        const vp = layer.calculateViewport(800, 600)

        expect(vp.x).toBe(10)
        expect(vp.y).toBe(430) // 600 - 150 - 20
        expect(vp.width).toBe(200)
        expect(vp.height).toBe(150)
    })


    test('calculateViewport with bottom-right anchor', () => {
        layer.viewport = {x: 10, y: 20, width: 200, height: 150, anchor: 'bottom-right'}

        const vp = layer.calculateViewport(800, 600)

        expect(vp.x).toBe(590) // 800 - 200 - 10
        expect(vp.y).toBe(430) // 600 - 150 - 20
        expect(vp.width).toBe(200)
        expect(vp.height).toBe(150)
    })


    test('markDirty and markClean', () => {
        layer.dirty = false

        layer.markDirty()
        expect(layer.dirty).toBe(true)

        layer.markClean()
        expect(layer.dirty).toBe(false)
    })


    test('setZIndex', () => {
        const element = document.createElement('div')
        layer.element = element

        layer.setZIndex(42)

        expect(layer.zIndex).toBe(42)
        expect(element.style.zIndex).toBe('42')
    })


    test('setVisible', () => {
        const element = document.createElement('div')
        layer.element = element

        layer.setVisible(false)
        expect(layer.visible).toBe(false)
        expect(element.style.display).toBe('none')

        layer.setVisible(true)
        expect(layer.visible).toBe(true)
        expect(element.style.display).toBe('block')
    })


    test('setOpacity', () => {
        const element = document.createElement('div')
        layer.element = element

        layer.setOpacity(0.7)

        expect(layer.opacity).toBe(0.7)
        expect(element.style.opacity).toBe('0.7')
    })


    test('setPointerEvents', () => {
        const element = document.createElement('div')
        layer.element = element

        layer.setPointerEvents('none')

        expect(layer.pointerEvents).toBe('none')
        expect(element.style.pointerEvents).toBe('none')
    })


    test('mount and unmount', () => {
        const container = document.createElement('div')
        const element = document.createElement('div')
        layer.element = element

        layer.mount(container)

        expect(layer.container).toBe(container)
        expect(container.contains(element)).toBe(true)

        layer.unmount()

        expect(layer.container).toBe(null)
        expect(container.contains(element)).toBe(false)
    })


    test('resize updates viewport', () => {
        layer.viewport = {x: 0, y: 0, width: '50%', height: '50%', anchor: 'top-left'}

        layer.resize(1000, 800)

        expect(layer.resolvedViewport.width).toBe(500)
        expect(layer.resolvedViewport.height).toBe(400)
    })


    test('applyViewport updates element styles', () => {
        const element = document.createElement('div')
        layer.element = element
        layer.calculateViewport(800, 600)

        layer.applyViewport()

        expect(element.style.left).toBe('0px')
        expect(element.style.top).toBe('0px')
        expect(element.style.width).toBe('800px')
        expect(element.style.height).toBe('600px')
    })


    test('destroy unmounts and clears element', () => {
        const container = document.createElement('div')
        const element = document.createElement('div')
        layer.element = element
        layer.mount(container)

        layer.dispose()

        expect(layer.element).toBe(null)
        expect(container.contains(element)).toBe(false)
    })

})

