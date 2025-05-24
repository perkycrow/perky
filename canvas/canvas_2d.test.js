import Canvas2D from './canvas_2d'
import Group2D from './group_2d'
import Circle from './circle'
import Rectangle from './rectangle'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe(Canvas2D, () => {
    let canvas
    let ctx
    let renderer
    let scene

    beforeEach(() => {
        ctx = {
            clearRect: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            scale: vi.fn(),
            translate: vi.fn(),
            transform: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            fill: vi.fn(),
            arc: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            drawImage: vi.fn(),
            fillText: vi.fn(),
            strokeStyle: '',
            fillStyle: '',
            lineWidth: 1,
            font: '',
            globalAlpha: 1
        }

        canvas = {
            width: 800,
            height: 600,
            getContext: vi.fn().mockReturnValue(ctx)
        }

        renderer = new Canvas2D(canvas)
        scene = new Group2D()
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(renderer.canvas).toBe(canvas)
        expect(renderer.ctx).toBe(ctx)
        expect(canvas.getContext).toHaveBeenCalledWith('2d')
    })


    test('render', () => {
        renderer.render(scene)

        expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600)
        expect(ctx.save).toHaveBeenCalled()
        expect(ctx.restore).toHaveBeenCalled()
        expect(ctx.scale).toHaveBeenCalledWith(1, -1)
        expect(ctx.translate).toHaveBeenCalledWith(0, -600)
        expect(ctx.translate).toHaveBeenCalledWith(400, 300)
    })


    test('drawAxes', () => {
        renderer.drawAxes()

        expect(ctx.strokeStyle).toBe('#ccc')
        expect(ctx.beginPath).toHaveBeenCalled()
        expect(ctx.moveTo).toHaveBeenCalledWith(-400, 0)
        expect(ctx.lineTo).toHaveBeenCalledWith(400, 0)
        expect(ctx.stroke).toHaveBeenCalled()
        expect(ctx.fillText).toHaveBeenCalledWith('X+', 370, 20)
        expect(ctx.fillText).toHaveBeenCalledWith('Y+', 10, -270)
    })


    test('updateOpacity', () => {
        const parent = new Group2D({opacity: 0.5})
        const child = new Circle({opacity: 0.8})
        parent.add(child)

        renderer.updateOpacity(parent)

        expect(parent.userData._computedOpacity).toBe(0.5)
        expect(child.userData._computedOpacity).toBe(0.4)
    })


    test('renderObject with invisible object', () => {
        const invisibleCircle = new Circle({visible: false})
        scene.add(invisibleCircle)

        const applyTransformationsSpy = vi.spyOn(renderer, 'applyTransformations')
        
        renderer.renderObject(invisibleCircle)

        expect(applyTransformationsSpy).not.toHaveBeenCalled()
    })


    test('renderObject with visible object', () => {
        const circle = new Circle({x: 100, y: 100})
        scene.add(circle)

        const applyTransformationsSpy = vi.spyOn(renderer, 'applyTransformations')
        const renderObjectTypeSpy = vi.spyOn(renderer, 'renderObjectType')
        
        renderer.renderObject(circle)

        expect(applyTransformationsSpy).toHaveBeenCalledWith(circle)
        expect(renderObjectTypeSpy).toHaveBeenCalledWith(circle)
        expect(ctx.save).toHaveBeenCalled()
        expect(ctx.restore).toHaveBeenCalled()
    })


    test('applyTransformations', () => {
        const object = new Circle({x: 100, y: 50})
        object.userData._computedOpacity = 0.7
        object.updateMatrixWorld(true)

        renderer.applyTransformations(object)

        expect(ctx.globalAlpha).toBe(0.7)
        expect(ctx.transform).toHaveBeenCalled()
    })


    test('renderCircle', () => {
        const circleData = {
            radius: 50,
            color: '#ff0000',
            strokeColor: '#000000',
            strokeWidth: 2
        }

        renderer.renderCircle(circleData)

        expect(ctx.beginPath).toHaveBeenCalled()
        expect(ctx.arc).toHaveBeenCalledWith(0, 0, 50, 0, Math.PI * 2)
        expect(ctx.fillStyle).toBe('#ff0000')
        expect(ctx.fill).toHaveBeenCalled()
        expect(ctx.strokeStyle).toBe('#000000')
        expect(ctx.lineWidth).toBe(2)
        expect(ctx.stroke).toHaveBeenCalled()
    })


    test('renderCircle without stroke', () => {
        const circleData = {
            radius: 50,
            color: '#ff0000',
            strokeWidth: 0
        }

        renderer.renderCircle(circleData)

        expect(ctx.fill).toHaveBeenCalled()
        expect(ctx.stroke).not.toHaveBeenCalled()
    })


    test('renderRectangle', () => {
        const rectData = {
            width: 100,
            height: 80,
            color: '#00ff00',
            strokeColor: '#000000',
            strokeWidth: 3
        }

        renderer.renderRectangle(rectData)

        expect(ctx.fillStyle).toBe('#00ff00')
        expect(ctx.fillRect).toHaveBeenCalledWith(-50, -40, 100, 80)
        expect(ctx.strokeStyle).toBe('#000000')
        expect(ctx.lineWidth).toBe(3)
        expect(ctx.strokeRect).toHaveBeenCalledWith(-50, -40, 100, 80)
    })


    test('renderRectangle without stroke', () => {
        const rectData = {
            width: 100,
            height: 80,
            color: '#00ff00',
            strokeWidth: 0
        }

        renderer.renderRectangle(rectData)

        expect(ctx.fillRect).toHaveBeenCalled()
        expect(ctx.strokeRect).not.toHaveBeenCalled()
    })


    test('renderImage with complete image', () => {
        const image = {
            complete: true
        }
        const imageData = {
            image,
            width: 100,
            height: 100
        }

        renderer.renderImage(imageData)

        expect(ctx.drawImage).toHaveBeenCalledWith(image, -50, -50, 100, 100)
    })


    test('renderImage with incomplete image', () => {
        const image = {
            complete: false
        }
        const imageData = {
            image,
            width: 100,
            height: 100
        }

        renderer.renderImage(imageData)

        expect(ctx.drawImage).not.toHaveBeenCalled()
    })


    test('renderImage without image', () => {
        const imageData = {
            image: null,
            width: 100,
            height: 100
        }

        renderer.renderImage(imageData)

        expect(ctx.drawImage).not.toHaveBeenCalled()
    })


    test('renderObjectType with unknown type', () => {
        const object = new Group2D()
        object.userData.renderType = 'unknown'

        renderer.renderObjectType(object)

        expect(ctx.fill).not.toHaveBeenCalled()
        expect(ctx.stroke).not.toHaveBeenCalled()
    })


    test('full render pipeline', () => {
        const circle = new Circle({
            x: 50,
            y: 50,
            radius: 30,
            color: '#ff0000',
            opacity: 0.8
        })
        
        const rect = new Rectangle({
            x: -50,
            y: -50,
            width: 60,
            height: 40,
            color: '#00ff00'
        })

        scene.add(circle)
        scene.add(rect)

        renderer.render(scene)

        expect(ctx.clearRect).toHaveBeenCalled()
        expect(ctx.arc).toHaveBeenCalled()
        expect(ctx.fillRect).toHaveBeenCalled()
    })

})
