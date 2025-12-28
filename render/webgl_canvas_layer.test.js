import {describe, test, expect, beforeEach} from 'vitest'
import WebGLCanvasLayer from './webgl_canvas_layer'
import Camera2D from './camera_2d'
import Group2D from './group_2d'


// WebGL mock is provided by test/setup.js


describe('WebGLCanvasLayer', () => {

    let layer

    beforeEach(() => {
        layer = new WebGLCanvasLayer({$id: 'test-webgl'})
    })


    describe('constructor', () => {

        test('creates canvas element', () => {
            expect(layer.canvas).toBeInstanceOf(HTMLCanvasElement)
            expect(layer.element).toBe(layer.canvas)
            expect(layer.canvas.style.position).toBe('absolute')
        })


        test('creates renderer (WebGLCanvas2D)', () => {
            expect(layer.renderer).toBeDefined()
            expect(layer.renderer.canvas).toBe(layer.canvas)
        })


        test('applies styles', () => {
            expect(layer.canvas.style.top).toBe('0px')
            expect(layer.canvas.style.left).toBe('0px')
        })


        test('with custom dimensions', () => {
            const l = new WebGLCanvasLayer({
                $id: 'test',
                width: 1024,
                height: 768
            })

            expect(l.canvas.width).toBe(1024)
            expect(l.canvas.height).toBe(768)
        })


        test('with pixelRatio', () => {
            const l = new WebGLCanvasLayer({
                $id: 'test',
                width: 800,
                height: 600,
                pixelRatio: 2
            })

            expect(l.canvas.width).toBe(1600)
            expect(l.canvas.height).toBe(1200)
            expect(l.canvas.style.width).toBe('800px')
            expect(l.canvas.style.height).toBe('600px')
        })


        test('with provided camera', () => {
            const camera = new Camera2D({x: 10, y: 20})
            const l = new WebGLCanvasLayer({$id: 'test', camera})

            expect(l.renderer.camera).toBe(camera)
        })


        test('with showGrid option', () => {
            const l = new WebGLCanvasLayer({$id: 'test', showGrid: true})
            expect(l.renderer.showGrid).toBe(true)
        })


        test('with backgroundColor option', () => {
            const l = new WebGLCanvasLayer({$id: 'test', backgroundColor: '#FF0000'})
            expect(l.renderer.backgroundColor).toBe('#FF0000')
        })


        test('with enableCulling option', () => {
            const l = new WebGLCanvasLayer({$id: 'test', enableCulling: true})
            expect(l.renderer.enableCulling).toBe(true)
        })

    })


    describe('setContent', () => {

        test('stores content and marks dirty', () => {
            expect(layer.dirty).toBe(true)
            layer.markClean()
            expect(layer.dirty).toBe(false)

            const scene = new Group2D()
            layer.setContent(scene)

            expect(layer.content).toBe(scene)
            expect(layer.dirty).toBe(true)
        })


        test('returns this for chaining', () => {
            const result = layer.setContent(new Group2D())
            expect(result).toBe(layer)
        })

    })


    describe('render', () => {

        test('calls renderer.render when dirty', () => {
            const scene = new Group2D()
            layer.setContent(scene)

            layer.render()
            expect(layer.dirty).toBe(false)
        })


        test('does nothing when not dirty', () => {
            const scene = new Group2D()
            layer.setContent(scene)
            layer.render()
            layer.markClean()

            expect(() => layer.render()).not.toThrow()
        })


        test('does nothing when no content', () => {
            layer.content = null
            expect(() => layer.render()).not.toThrow()
        })

    })


    describe('resize', () => {

        test('updates canvas dimensions', () => {
            layer.resize(1024, 768)

            expect(layer.canvas.width).toBe(1024)
            expect(layer.canvas.height).toBe(768)
            expect(layer.dirty).toBe(true)
        })


        test('returns this for chaining', () => {
            const result = layer.resize(800, 600)
            expect(result).toBe(layer)
        })

    })


    describe('applyStyles', () => {

        test('applies zIndex', () => {
            const l = new WebGLCanvasLayer({$id: 'test', zIndex: 10})
            expect(l.canvas.style.zIndex).toBe('10')
        })


        test('applies opacity', () => {
            const l = new WebGLCanvasLayer({$id: 'test', opacity: 0.5})
            expect(l.canvas.style.opacity).toBe('0.5')
        })


        test('applies visibility', () => {
            const l = new WebGLCanvasLayer({$id: 'test', visible: false})
            expect(l.canvas.style.display).toBe('none')
        })


        test('applies pointerEvents', () => {
            const l = new WebGLCanvasLayer({$id: 'test', pointerEvents: 'none'})
            expect(l.canvas.style.pointerEvents).toBe('none')
        })

    })


    describe('autoRender', () => {

        test('defaults to true', () => {
            expect(layer.autoRender).toBe(true)
        })


        test('can be set to false', () => {
            const l = new WebGLCanvasLayer({$id: 'test', autoRender: false})
            expect(l.autoRender).toBe(false)
        })

    })

})
