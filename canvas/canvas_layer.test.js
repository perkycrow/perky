import {describe, test, expect, beforeEach} from 'vitest'
import CanvasLayer from './canvas_layer'
import Camera2D from './camera_2d'
import Group2D from './group_2d'
import Circle from './circle'


describe(CanvasLayer, () => {

    let layer

    beforeEach(() => {
        layer = new CanvasLayer('test-canvas')
    })


    test('constructor creates canvas element', () => {
        expect(layer.canvas).toBeInstanceOf(HTMLCanvasElement)
        expect(layer.element).toBe(layer.canvas)
        expect(layer.canvas.style.position).toBe('absolute')
    })


    test('constructor creates renderer', () => {
        expect(layer.renderer).toBeDefined()
        expect(layer.renderer.canvas).toBe(layer.canvas)
    })


    test('constructor creates default camera if not provided', () => {
        expect(layer.renderer.camera).toBeInstanceOf(Camera2D)
    })


    test('constructor with provided camera', () => {
        const camera = new Camera2D({x: 10, y: 20})
        const l = new CanvasLayer('test', {camera})

        expect(l.renderer.camera).toBe(camera)
    })


    test('constructor with custom dimensions', () => {
        const l = new CanvasLayer('test', {
            width: 1024,
            height: 768
        })

        expect(l.canvas.width).toBe(1024)
        expect(l.canvas.height).toBe(768)
    })


    test('constructor with pixelRatio', () => {
        const l = new CanvasLayer('test', {
            width: 800,
            height: 600,
            pixelRatio: 2
        })

        expect(l.canvas.width).toBe(1600)
        expect(l.canvas.height).toBe(1200)

        expect(l.canvas.style.width).toBe('800px')
        expect(l.canvas.style.height).toBe('600px')
    })


    test('constructor with showAxes option', () => {
        const l = new CanvasLayer('test', {showAxes: true})
        expect(l.renderer.showAxes).toBe(true)
    })


    test('constructor with showGrid option', () => {
        const l = new CanvasLayer('test', {showGrid: true})
        expect(l.renderer.showGrid).toBe(true)
    })


    test('constructor with backgroundColor option', () => {
        const l = new CanvasLayer('test', {backgroundColor: '#FF0000'})
        expect(l.renderer.backgroundColor).toBe('#FF0000')
    })


    test('constructor with enableCulling option', () => {
        const l = new CanvasLayer('test', {enableCulling: true})
        expect(l.renderer.enableCulling).toBe(true)
    })


    test('setContent stores content and marks dirty', () => {
        expect(layer.dirty).toBe(true)
        layer.markClean()
        expect(layer.dirty).toBe(false)
        
        const scene = new Group2D()
        layer.setContent(scene)
        
        expect(layer.content).toBe(scene)
        expect(layer.dirty).toBe(true)
    })


    test('render calls renderer.render when dirty', () => {
        const scene = new Group2D()
        layer.setContent(scene)

        layer.render()
        expect(layer.dirty).toBe(false)
    })


    test('render does nothing when not dirty', () => {
        const scene = new Group2D()
        layer.setContent(scene)
        layer.render()

        layer.markClean()

        expect(() => layer.render()).not.toThrow()
    })


    test('render does nothing when no content', () => {
        layer.content = null
        expect(() => layer.render()).not.toThrow()
    })


    test('resize updates canvas dimensions', () => {
        layer.resize(1024, 768)
        
        expect(layer.canvas.width).toBe(1024)
        expect(layer.canvas.height).toBe(768)
        expect(layer.dirty).toBe(true)
    })


    test('resize with pixelRatio scales internal canvas', () => {
        const l = new CanvasLayer('test', {pixelRatio: 2})
        
        l.resize(800, 600)
        
        expect(l.canvas.width).toBe(1600)
        expect(l.canvas.height).toBe(1200)
        expect(l.canvas.style.width).toBe('800px')
        expect(l.canvas.style.height).toBe('600px')
    })


    test('resize updates camera viewport dimensions', () => {
        const camera = new Camera2D()
        const l = new CanvasLayer('test', {camera, pixelRatio: 1})
        
        l.resize(1024, 768)
        
        expect(camera.viewportWidth).toBe(1024)
        expect(camera.viewportHeight).toBe(768)
    })


    test('resize with viewport', () => {
        const l = new CanvasLayer('test', {
            viewport: {
                x: 0,
                y: 0,
                width: '50%',
                height: '50%',
                anchor: 'top-left'
            }
        })
        
        l.resize(1000, 800)

        expect(l.canvas.width).toBe(500)
        expect(l.canvas.height).toBe(400)
    })


    test('autoRender defaults to true', () => {
        expect(layer.autoRender).toBe(true)
    })


    test('autoRender can be set to false', () => {
        const l = new CanvasLayer('test', {autoRender: false})
        expect(l.autoRender).toBe(false)
    })


    test('destroy cleans up', () => {
        const container = document.createElement('div')
        layer.mount(container)
        
        layer.destroy()
        
        expect(layer.element).toBe(null)
        expect(container.contains(layer.canvas)).toBe(false)
    })


    test('integration: full render cycle', () => {
        const scene = new Group2D()
        const circle = new Circle({x: 0, y: 0, radius: 1, color: '#FF0000'})
        scene.addChild(circle)
        
        layer.setContent(scene)
        layer.render()

        expect(layer.dirty).toBe(false)
    })


    test('provided camera gets viewport updated', () => {
        const camera = new Camera2D({
            viewportWidth: 100,
            viewportHeight: 100,
            pixelRatio: 1
        })
        
        new CanvasLayer('test', {
            width: 800,
            height: 600,
            pixelRatio: 2,
            camera
        })
        
        expect(camera.viewportWidth).toBe(800)
        expect(camera.viewportHeight).toBe(600)
        expect(camera.pixelRatio).toBe(1)
    })


    test('viewport with anchor top-right', () => {
        const l = new CanvasLayer('test', {
            width: 1000,
            height: 800,
            viewport: {
                x: 10,
                y: 10,
                width: 200,
                height: 150,
                anchor: 'top-right'
            }
        })
        
        // Canvas should be 200x150
        expect(l.canvas.width).toBe(200)
        expect(l.canvas.height).toBe(150)
        
        // Positioned at top-right: 1000 - 200 - 10 = 790
        expect(l.canvas.style.left).toBe('790px')
        expect(l.canvas.style.top).toBe('10px')
    })


    test('grid options passed to renderer', () => {
        const l = new CanvasLayer('test', {
            showGrid: true,
            gridStep: 2,
            gridOpacity: 0.3,
            gridColor: '#FF0000'
        })
        
        expect(l.renderer.showGrid).toBe(true)
        expect(l.renderer.gridOptions.step).toBe(2)
        expect(l.renderer.gridOptions.opacity).toBe(0.3)
        expect(l.renderer.gridOptions.color).toBe('#FF0000')
    })

})

