import {describe, test, expect, beforeEach, vi} from 'vitest'
import Canvas2D from './canvas_2d'
import Camera2D from './camera_2d'
import Group2D from './group_2d'
import Circle from './circle'
import Rectangle from './rectangle'


global.ResizeObserver = class ResizeObserver {
    constructor (callback) {
        this.callback = callback
    }
    observe (target) {
        this.callback([{
            target,
            contentRect: {
                width: target.clientWidth || 0,
                height: target.clientHeight || 0
            }
        }])
    }
    disconnect () { } // eslint-disable-line class-methods-use-this
    unobserve () { } // eslint-disable-line class-methods-use-this
}


describe(Canvas2D, () => {

    let canvas
    let renderer

    beforeEach(() => {
        canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 600
        renderer = new Canvas2D({canvas})
    })


    test('constructor with canvas', () => {
        expect(renderer.canvas).toBe(canvas)
        expect(renderer.ctx).toBe(canvas.getContext('2d'))
        expect(renderer.camera).toBeInstanceOf(Camera2D)
        expect(renderer.showAxes).toBe(false)
        expect(renderer.backgroundColor).toBe(null)
    })


    test('constructor with container', () => {
        const container = document.createElement('div')
        const r = new Canvas2D({container, width: 400, height: 300})

        expect(r.canvas).toBeInstanceOf(HTMLCanvasElement)
        expect(r.container).toBe(container)
        expect(container.contains(r.canvas)).toBe(true)
    })


    test('constructor throws without canvas or container', () => {
        expect(() => new Canvas2D({})).toThrow('Canvas2D requires either a "canvas" or "container" option')
    })


    test('constructor with options', () => {
        const camera = new Camera2D()
        const r = new Canvas2D({
            canvas,
            camera,
            showAxes: true,
            backgroundColor: '#ffffff'
        })

        expect(r.camera).toBe(camera)
        expect(r.showAxes).toBe(true)
        expect(r.backgroundColor).toBe('#ffffff')
    })


    test('autoFit observes container resize', () => {
        const container = document.createElement('div')

        Object.defineProperty(container, 'clientWidth', {value: 400, writable: true})
        Object.defineProperty(container, 'clientHeight', {value: 300, writable: true})

        const r = new Canvas2D({container, autoFit: true})

        expect(r.displayWidth).toBe(400)
        expect(r.displayHeight).toBe(300)

        r.dispose()
    })


    test('dispose cleans up autoFit observer', () => {
        const container = document.createElement('div')
        Object.defineProperty(container, 'clientWidth', {value: 400, writable: true})
        Object.defineProperty(container, 'clientHeight', {value: 300, writable: true})

        const r = new Canvas2D({container, autoFit: true})

        expect(r.canvas).toBeInstanceOf(HTMLCanvasElement)
        expect(r.ctx).toBeDefined()

        r.dispose()

        expect(r.canvas).toBe(null)
        expect(r.ctx).toBe(null)
    })


    test('render clears canvas', () => {
        const scene = new Group2D()
        const ctx = canvas.getContext('2d')

        vi.spyOn(ctx, 'clearRect')

        renderer.render(scene)

        expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600)
    })


    test('render with background color', () => {
        const scene = new Group2D()
        const ctx = canvas.getContext('2d')

        renderer.backgroundColor = '#ff0000'
        vi.spyOn(ctx, 'fillRect')

        renderer.render(scene)

        expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600)
    })


    test('render updates world matrix', () => {
        const scene = new Group2D()
        vi.spyOn(scene, 'updateWorldMatrix')

        renderer.render(scene)

        expect(scene.updateWorldMatrix).toHaveBeenCalledWith(true)
    })


    test('render with visible object', () => {
        const scene = new Group2D()
        const circle = new Circle({radius: 10, color: '#ff0000'})
        scene.addChild(circle)

        expect(() => renderer.render(scene)).not.toThrow()
    })


    test('render with invisible object', () => {
        const scene = new Group2D()
        const circle = new Circle({radius: 10, color: '#ff0000', visible: false})
        scene.addChild(circle)

        vi.spyOn(circle, 'render')

        renderer.render(scene)

        expect(circle.render).not.toHaveBeenCalled()
    })


    test('render with nested groups', () => {
        const scene = new Group2D()
        const group1 = new Group2D({x: 10, y: 20})
        const group2 = new Group2D({x: 5, y: 5})
        const circle = new Circle({radius: 10, color: '#ff0000'})

        scene.addChild(group1)
        group1.addChild(group2)
        group2.addChild(circle)

        expect(() => renderer.render(scene)).not.toThrow()
    })


    test('render with opacity', () => {
        const scene = new Group2D()
        const circle = new Circle({radius: 10, color: '#ff0000', opacity: 0.5})
        scene.addChild(circle)

        expect(() => renderer.render(scene)).not.toThrow()
    })


    test('render respects camera transformations', () => {
        const scene = new Group2D()
        const circle = new Circle({x: 0, y: 0, radius: 10, color: '#ff0000'})
        scene.addChild(circle)

        renderer.camera.setPosition(5, 5)
        renderer.camera.setZoom(2)

        expect(() => renderer.render(scene)).not.toThrow()
    })


    test('render with showAxes', () => {
        const scene = new Group2D()
        renderer.showAxes = true

        expect(() => renderer.render(scene)).not.toThrow()
    })


    test('render multiple objects', () => {
        const scene = new Group2D()
        scene.addChild(
            new Circle({x: 0, y: 0, radius: 10, color: '#ff0000'}),
            new Rectangle({x: 50, y: 50, width: 20, height: 20, color: '#00ff00'}),
            new Circle({x: -50, y: -50, radius: 15, color: '#0000ff'})
        )

        expect(() => renderer.render(scene)).not.toThrow()
    })


    test('render with rotation', () => {
        const scene = new Group2D()
        const rect = new Rectangle({
            x: 0,
            y: 0,
            width: 50,
            height: 30,
            rotation: Math.PI / 4,
            color: '#ff0000'
        })
        scene.addChild(rect)

        expect(() => renderer.render(scene)).not.toThrow()
    })


    test('render with scale', () => {
        const scene = new Group2D()
        const circle = new Circle({
            x: 0,
            y: 0,
            radius: 10,
            scaleX: 2,
            scaleY: 3,
            color: '#ff0000'
        })
        scene.addChild(circle)

        expect(() => renderer.render(scene)).not.toThrow()
    })

})
