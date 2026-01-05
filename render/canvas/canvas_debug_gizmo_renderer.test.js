import {describe, test, expect, beforeEach} from 'vitest'
import CanvasDebugGizmoRenderer from './canvas_debug_gizmo_renderer.js'


describe('CanvasDebugGizmoRenderer', () => {

    let renderer
    let ctx
    let mockContext


    beforeEach(() => {
        renderer = new CanvasDebugGizmoRenderer()
        ctx = {
            save: () => {},
            restore: () => {},
            transform: () => {},
            globalAlpha: 1,
            strokeStyle: '',
            fillStyle: '',
            lineWidth: 0,
            setLineDash: () => {},
            strokeRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            stroke: () => {},
            fill: () => {},
            arc: () => {}
        }
        mockContext = {ctx}
        renderer.init(mockContext)
        renderer.reset()
    })


    test('handles returns empty array', () => {
        expect(CanvasDebugGizmoRenderer.handles).toEqual([])
    })


    test('collected returns empty array initially', () => {
        expect(renderer.collected).toEqual([])
    })


    test('collectGizmo adds object to collected', () => {
        const obj = {name: 'test'}
        renderer.collectGizmo(obj, 0.8)
        expect(renderer.collected).toEqual([{object: obj, opacity: 0.8, hints: null}])
    })


    test('collect adds object with hints', () => {
        const obj = {name: 'test'}
        const hints = {key: 'value'}
        renderer.collect(obj, 0.5, hints)
        expect(renderer.collected).toEqual([{object: obj, opacity: 0.5, hints}])
    })


    test('reset clears collected', () => {
        renderer.collect({}, 1, null)
        renderer.reset()
        expect(renderer.collected).toEqual([])
    })


    describe('flush', () => {

        test('applies world matrix transform', () => {
            let transformArgs = null
            ctx.transform = (...args) => {
                transformArgs = args
            }

            const obj = {
                worldMatrix: [1, 2, 3, 4, 5, 6],
                debugGizmos: null
            }
            renderer.collectGizmo(obj, 1)
            renderer.flush()

            expect(transformArgs).toEqual([1, 2, 3, 4, 5, 6])
        })


        test('sets global alpha from opacity', () => {
            const obj = {
                worldMatrix: [1, 0, 0, 1, 0, 0],
                debugGizmos: null
            }
            renderer.collectGizmo(obj, 0.7)
            renderer.flush()

            expect(ctx.globalAlpha).toBe(0.7)
        })


        test('saves and restores context for each object', () => {
            let saveCount = 0
            let restoreCount = 0
            ctx.save = () => saveCount++
            ctx.restore = () => restoreCount++

            const obj1 = {worldMatrix: [1, 0, 0, 1, 0, 0], debugGizmos: null}
            const obj2 = {worldMatrix: [1, 0, 0, 1, 0, 0], debugGizmos: null}
            renderer.collectGizmo(obj1, 1)
            renderer.collectGizmo(obj2, 1)
            renderer.flush()

            expect(saveCount).toBe(2)
            expect(restoreCount).toBe(2)
        })

    })


    describe('renderGizmos', () => {

        test('returns early if debugGizmos is null', () => {
            const obj = {debugGizmos: null, getBounds: () => ({})}
            expect(() => renderer.renderGizmos(obj, ctx)).not.toThrow()
        })


        test('does not render bounds when size is zero', () => {
            let strokeRectCalled = false
            ctx.strokeRect = () => {
                strokeRectCalled = true
            }

            const obj = {
                debugGizmos: {bounds: true},
                getBounds: () => ({minX: 0, minY: 0, width: 0, height: 0})
            }
            renderer.renderGizmos(obj, ctx)

            expect(strokeRectCalled).toBe(false)
        })


        test('renders bounds when size is non-zero', () => {
            let strokeRectCalled = false
            ctx.strokeRect = () => {
                strokeRectCalled = true
            }

            const obj = {
                debugGizmos: {bounds: true},
                getBounds: () => ({minX: 0, minY: 0, width: 10, height: 10})
            }
            renderer.renderGizmos(obj, ctx)

            expect(strokeRectCalled).toBe(true)
        })


        test('renders anchor when enabled', () => {
            let arcCalled = false
            ctx.arc = () => {
                arcCalled = true
            }

            const obj = {
                debugGizmos: {anchor: true},
                anchorX: 0.5,
                anchorY: 0.5,
                getBounds: () => ({minX: 0, minY: 0, width: 10, height: 10})
            }
            renderer.renderGizmos(obj, ctx)

            expect(arcCalled).toBe(true)
        })


        test('renders pivot when enabled', () => {
            let arcCalled = false
            ctx.arc = () => {
                arcCalled = true
            }

            const obj = {
                debugGizmos: {pivot: true},
                pivotX: 5,
                pivotY: 5,
                getBounds: () => ({minX: 0, minY: 0, width: 10, height: 10})
            }
            renderer.renderGizmos(obj, ctx)

            expect(arcCalled).toBe(true)
        })


        test('renders origin when enabled', () => {
            let arcCalled = false
            ctx.arc = () => {
                arcCalled = true
            }

            const obj = {
                debugGizmos: {origin: true},
                getBounds: () => ({minX: 0, minY: 0, width: 10, height: 10})
            }
            renderer.renderGizmos(obj, ctx)

            expect(arcCalled).toBe(true)
        })

    })


    describe('renderBounds', () => {

        test('sets stroke style to green', () => {
            const bounds = {minX: 0, minY: 0, width: 10, height: 10}
            renderer.renderBounds(ctx, bounds)
            expect(ctx.strokeStyle).toBe('rgba(0, 255, 0, 0.8)')
        })


        test('sets line dash pattern', () => {
            let dashPattern = null
            ctx.setLineDash = (pattern) => {
                dashPattern = pattern
            }
            const bounds = {minX: 0, minY: 0, width: 10, height: 10}
            renderer.renderBounds(ctx, bounds)
            expect(dashPattern).toEqual([])
        })


        test('calls strokeRect with bounds', () => {
            let rectArgs = null
            ctx.strokeRect = (...args) => {
                rectArgs = args
            }
            const bounds = {minX: 5, minY: 10, width: 20, height: 30}
            renderer.renderBounds(ctx, bounds)
            expect(rectArgs).toEqual([5, 10, 20, 30])
        })

    })


    describe('renderAnchor', () => {

        test('sets stroke style to yellow', () => {
            const obj = {anchorX: 0.5, anchorY: 0.5}
            const bounds = {minX: 0, minY: 0, width: 10, height: 10}
            renderer.renderAnchor(ctx, obj, bounds)
            expect(ctx.strokeStyle).toBe('rgba(255, 255, 0, 1)')
        })


        test('sets fill style to semi-transparent yellow', () => {
            const obj = {anchorX: 0.5, anchorY: 0.5}
            const bounds = {minX: 0, minY: 0, width: 10, height: 10}
            renderer.renderAnchor(ctx, obj, bounds)
            expect(ctx.fillStyle).toBe('rgba(255, 255, 0, 0.5)')
        })

    })


    test('renderPivot sets stroke style to magenta', () => {
        const obj = {pivotX: 5, pivotY: 5}
        renderer.renderPivot(ctx, obj)
        expect(ctx.strokeStyle).toBe('rgba(255, 0, 255, 1)')
    })


    describe('renderOrigin', () => {

        test('draws red x-axis', () => {
            const strokes = []
            ctx.beginPath = () => strokes.push('begin')
            ctx.stroke = () => strokes.push(ctx.strokeStyle)

            renderer.renderOrigin(ctx)

            expect(strokes).toContain('rgba(255, 0, 0, 1)')
        })


        test('draws green y-axis', () => {
            const strokes = []
            ctx.stroke = () => strokes.push(ctx.strokeStyle)

            renderer.renderOrigin(ctx)

            expect(strokes).toContain('rgba(0, 255, 0, 1)')
        })


        test('draws white center dot', () => {
            renderer.renderOrigin(ctx)
            expect(ctx.fillStyle).toBe('rgba(255, 255, 255, 1)')
        })

    })

})
