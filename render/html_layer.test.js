import {describe, test, expect, beforeEach} from 'vitest'
import HTMLLayer from './html_layer.js'
import Camera2D from './camera_2d.js'


describe(HTMLLayer, () => {

    let layer

    beforeEach(() => {
        layer = new HTMLLayer({$id: 'test-html'})
    })


    test('constructor creates div element', () => {
        expect(layer.div).toBeInstanceOf(HTMLDivElement)
        expect(layer.element).toBe(layer.div)
        expect(layer.div.style.position).toBe('absolute')
    })


    test('constructor with content option', () => {
        const l = new HTMLLayer({
            $id: 'test',
            content: '<p>Hello World</p>'
        })

        expect(l.div.innerHTML).toBe('<p>Hello World</p>')
    })


    test('constructor with className option', () => {
        const l = new HTMLLayer({
            $id: 'test',
            className: 'my-custom-class'
        })

        expect(l.div.className).toBe('my-custom-class')
    })


    test('constructor with camera option', () => {
        const camera = new Camera2D()
        const l = new HTMLLayer({$id: 'test', camera})

        expect(l.camera).toBe(camera)
    })


    test('setContent with string', () => {
        layer.setContent('<h1>Title</h1>')
        expect(layer.div.innerHTML).toBe('<h1>Title</h1>')
    })


    test('setContent with HTMLElement', () => {
        const p = document.createElement('p')
        p.textContent = 'Paragraph'

        layer.setContent(p)

        expect(layer.div.contains(p)).toBe(true)
        expect(layer.div.children.length).toBe(1)
    })


    test('addClass and removeClass', () => {
        layer.addClass('foo')
        expect(layer.div.classList.contains('foo')).toBe(true)

        layer.addClass('bar')
        expect(layer.div.classList.contains('bar')).toBe(true)

        layer.removeClass('foo')
        expect(layer.div.classList.contains('foo')).toBe(false)
        expect(layer.div.classList.contains('bar')).toBe(true)
    })


    test('setStyle', () => {
        layer.setStyle('backgroundColor', 'red')
        expect(layer.div.style.backgroundColor).toBe('red')
    })


    test('setCamera', () => {
        const camera = new Camera2D()

        layer.setCamera(camera)

        expect(layer.camera).toBe(camera)
    })


    test('createWorldElement creates element', () => {
        layer.camera = new Camera2D()

        const el = layer.createWorldElement('<div>Test</div>', 10, 20)

        expect(el).toBeInstanceOf(HTMLDivElement)
        expect(el.innerHTML).toBe('<div>Test</div>')
        expect(layer.div.contains(el)).toBe(true)
        expect(layer.worldElements.length).toBe(1)
    })


    test('createWorldElement with options', () => {
        layer.camera = new Camera2D()

        const el = layer.createWorldElement(
            '<span>Label</span>',
            5,
            10,
            {
                offsetX: 10,
                offsetY: 20,
                worldOffsetX: 0.5,
                worldOffsetY: 1,
                pointerEvents: 'none'
            }
        )

        expect(el.style.pointerEvents).toBe('none')

        const worldEl = layer.worldElements[0]
        expect(worldEl.worldX).toBe(5)
        expect(worldEl.worldY).toBe(10)
        expect(worldEl.offsetX).toBe(10)
        expect(worldEl.offsetY).toBe(20)
        expect(worldEl.worldOffsetX).toBe(0.5)
        expect(worldEl.worldOffsetY).toBe(1)
    })


    test('createWorldElement with targetObject', () => {
        layer.camera = new Camera2D()
        const target = {x: 5, y: 10}

        layer.createWorldElement('<div>Target</div>', 0, 0, {
            targetObject: target
        })

        const worldEl = layer.worldElements[0]
        expect(worldEl.targetObject).toBe(target)
    })


    test('removeWorldElement', () => {
        layer.camera = new Camera2D()
        const el = layer.createWorldElement('<div>Remove me</div>', 0, 0)

        expect(layer.worldElements.length).toBe(1)
        expect(layer.div.contains(el)).toBe(true)

        layer.removeWorldElement(el)

        expect(layer.worldElements.length).toBe(0)
        expect(layer.div.contains(el)).toBe(false)
    })


    test('updateElementWorldPosition', () => {
        layer.camera = new Camera2D()
        const el = layer.createWorldElement('<div>Move me</div>', 0, 0)

        layer.updateElementWorldPosition(el, 15, 25)

        const worldEl = layer.worldElements[0]
        expect(worldEl.worldX).toBe(15)
        expect(worldEl.worldY).toBe(25)
    })


    test('setElementTarget', () => {
        layer.camera = new Camera2D()
        const el = layer.createWorldElement('<div>Target me</div>', 0, 0)
        const target = {x: 10, y: 20}

        layer.setElementTarget(el, target)

        const worldEl = layer.worldElements[0]
        expect(worldEl.targetObject).toBe(target)
    })


    test('updateWorldElements without camera does nothing', () => {
        layer.camera = null
        layer.createWorldElement('<div>No camera</div>', 10, 10)

        expect(() => layer.updateWorldElements()).not.toThrow()
    })


    test('updateWorldElements positions element', () => {
        const camera = new Camera2D({
            x: 0,
            y: 0,
            zoom: 1,
            unitsInView: 10,
            viewportWidth: 800,
            viewportHeight: 600,
            pixelRatio: 1
        })
        layer.camera = camera

        const el = layer.createWorldElement('<div>Position me</div>', 0, 0)

        layer.updateWorldElements(true)

        expect(el.style.transform).toContain('translate')
    })


    test('updateWorldElements syncs targetObject position', () => {
        const camera = new Camera2D()
        layer.camera = camera

        const target = {x: 5, y: 10}
        layer.createWorldElement('<div>Follow</div>', 0, 0, {
            targetObject: target
        })

        layer.updateWorldElements(true)

        const worldEl = layer.worldElements[0]
        expect(worldEl.worldX).toBe(5)
        expect(worldEl.worldY).toBe(10)
    })


    test('updateWorldElements with inheritTransform', () => {
        const camera = new Camera2D()
        layer.camera = camera

        const target = {
            x: 0,
            y: 0,
            rotation: Math.PI / 4,
            scaleX: 2,
            scaleY: 2
        }

        const el = layer.createWorldElement('<div>Inherit</div>', 0, 0, {
            targetObject: target,
            inheritTransform: true
        })

        layer.updateWorldElements(true)

        expect(el.style.transform).toContain('rotate')
        expect(el.style.transform).toContain('scale')
    })


    test('updateWorldElements culls offscreen elements', () => {
        const camera = new Camera2D({
            x: 0,
            y: 0,
            zoom: 1,
            unitsInView: 10,
            viewportWidth: 800,
            viewportHeight: 600,
            pixelRatio: 1
        })
        layer.camera = camera

        const el = layer.createWorldElement('<div>Offscreen</div>', 1000, 1000)

        layer.updateWorldElements(true)

        const worldEl = layer.worldElements[0]
        expect(worldEl.visible).toBe(false)
        expect(el.style.display).toBe('none')
    })


    test('cssToWorldUnits', () => {
        const camera = new Camera2D({
            unitsInView: 10,
            viewportHeight: 600,
            zoom: 1,
            pixelRatio: 1
        })
        layer.camera = camera

        const units = layer.cssToWorldUnits(120)

        expect(units).toBe(2)
    })


    test('worldUnitsToCss', () => {
        const camera = new Camera2D({
            unitsInView: 10,
            viewportHeight: 600,
            zoom: 1,
            pixelRatio: 1
        })
        layer.camera = camera

        const pixels = layer.worldUnitsToCss(3)

        expect(pixels).toBe(180)
    })


    test('resize updates viewport', () => {
        layer.viewport = {x: 0, y: 0, width: '50%', height: '50%', anchor: 'top-left'}

        layer.resize(1000, 800)

        expect(layer.div.style.width).toBe('500px')
        expect(layer.div.style.height).toBe('400px')
    })


    test('applyStyles sets div styles correctly', () => {
        const l = new HTMLLayer({
            $id: 'styled-html',
            zIndex: 10,
            opacity: 0.7,
            pointerEvents: 'none',
            visible: false
        })

        expect(l.div.style.position).toBe('absolute')
        expect(l.div.style.top).toBe('0')
        expect(l.div.style.left).toBe('0')
        expect(l.div.style.width).toBe('100%')
        expect(l.div.style.height).toBe('100%')
        expect(l.div.style.zIndex).toBe('10')
        expect(l.div.style.opacity).toBe('0.7')
        expect(l.div.style.pointerEvents).toBe('none')
        expect(l.div.style.display).toBe('none')
    })

})

