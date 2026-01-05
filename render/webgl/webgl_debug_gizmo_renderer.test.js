import {describe, test, expect, beforeEach} from 'vitest'
import WebGLDebugGizmoRenderer from './webgl_debug_gizmo_renderer.js'


describe('WebGLDebugGizmoRenderer', () => {

    let renderer
    let mockGl
    let mockContext


    beforeEach(() => {
        renderer = new WebGLDebugGizmoRenderer()
        mockGl = {
            createBuffer: () => ({}),
            deleteBuffer: () => {},
            bindBuffer: () => {},
            bufferData: () => {},
            enableVertexAttribArray: () => {},
            vertexAttribPointer: () => {},
            drawArrays: () => {},
            useProgram: () => {},
            uniformMatrix3fv: () => {},
            ARRAY_BUFFER: 0x8892,
            DYNAMIC_DRAW: 0x88E8,
            FLOAT: 0x1406,
            LINES: 0x0001,
            TRIANGLE_FAN: 0x0006
        }
        mockContext = {
            gl: mockGl,
            primitiveProgram: {
                program: {},
                uniforms: {
                    uProjectionMatrix: 0,
                    uViewMatrix: 1
                },
                attributes: {
                    aPosition: 0,
                    aColor: 1
                }
            }
        }
    })


    test('handles returns empty array', () => {
        expect(WebGLDebugGizmoRenderer.handles).toEqual([])
    })


    test('init creates vertex buffer', () => {
        let bufferCreated = false
        mockGl.createBuffer = () => {
            bufferCreated = true
            return {}
        }
        renderer.init(mockContext)
        expect(bufferCreated).toBe(true)
    })


    test('collectGizmo adds object', () => {
        renderer.init(mockContext)
        const obj = {name: 'test'}
        renderer.collectGizmo(obj, 0.8)
        expect(() => renderer.flush({projectionMatrix: [], viewMatrix: []})).not.toThrow()
    })


    test('reset clears gizmo objects', () => {
        renderer.init(mockContext)
        renderer.collectGizmo({}, 1)
        renderer.reset()

        let useProgramCalled = false
        mockGl.useProgram = () => {
            useProgramCalled = true
        }
        renderer.flush({projectionMatrix: [], viewMatrix: []})

        expect(useProgramCalled).toBe(false)
    })


    describe('flush', () => {

        test('does nothing when no gizmo objects', () => {
            renderer.init(mockContext)

            let useProgramCalled = false
            mockGl.useProgram = () => {
                useProgramCalled = true
            }
            renderer.flush({projectionMatrix: [], viewMatrix: []})

            expect(useProgramCalled).toBe(false)
        })


        test('sets up program and matrices', () => {
            renderer.init(mockContext)
            renderer.collectGizmo({
                debugGizmos: null,
                worldMatrix: [1, 0, 0, 1, 0, 0],
                getBounds: () => ({minX: 0, minY: 0, width: 0, height: 0})
            }, 1)

            let useProgramCalled = false
            let projectionSet = false
            let viewSet = false

            mockGl.useProgram = () => {
                useProgramCalled = true
            }
            mockGl.uniformMatrix3fv = (loc) => {
                if (loc === 0) {
                    projectionSet = true
                }
                if (loc === 1) {
                    viewSet = true
                }
            }

            renderer.flush({projectionMatrix: [], viewMatrix: []})

            expect(useProgramCalled).toBe(true)
            expect(projectionSet).toBe(true)
            expect(viewSet).toBe(true)
        })

    })


    describe('renderGizmos', () => {

        test('returns early if debugGizmos is null', () => {
            renderer.init(mockContext)
            const obj = {debugGizmos: null, getBounds: () => ({})}
            expect(() => renderer.renderGizmos(obj, 1)).not.toThrow()
        })


        test('does not render bounds when size is zero', () => {
            renderer.init(mockContext)
            let drawCalled = false
            mockGl.drawArrays = () => {
                drawCalled = true
            }

            const obj = {
                debugGizmos: {bounds: true},
                worldMatrix: [1, 0, 0, 1, 0, 0],
                getBounds: () => ({minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0})
            }
            renderer.renderGizmos(obj, 1)

            expect(drawCalled).toBe(false)
        })


        test('renders bounds when size is non-zero', () => {
            renderer.init(mockContext)
            let drawCalled = false
            mockGl.drawArrays = () => {
                drawCalled = true
            }

            const obj = {
                debugGizmos: {bounds: true},
                worldMatrix: [1, 0, 0, 1, 0, 0],
                getBounds: () => ({minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10})
            }
            renderer.renderGizmos(obj, 1)

            expect(drawCalled).toBe(true)
        })


        test('renders anchor when enabled', () => {
            renderer.init(mockContext)
            let drawCallCount = 0
            mockGl.drawArrays = () => {
                drawCallCount++
            }

            const obj = {
                debugGizmos: {anchor: true},
                worldMatrix: [1, 0, 0, 1, 0, 0],
                anchorX: 0.5,
                anchorY: 0.5,
                getBounds: () => ({minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10})
            }
            renderer.renderGizmos(obj, 1)

            expect(drawCallCount).toBeGreaterThan(0)
        })


        test('renders pivot when enabled', () => {
            renderer.init(mockContext)
            let drawCallCount = 0
            mockGl.drawArrays = () => {
                drawCallCount++
            }

            const obj = {
                debugGizmos: {pivot: true},
                worldMatrix: [1, 0, 0, 1, 0, 0],
                pivotX: 5,
                pivotY: 5,
                getBounds: () => ({minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10})
            }
            renderer.renderGizmos(obj, 1)

            expect(drawCallCount).toBeGreaterThan(0)
        })


        test('renders origin when enabled', () => {
            renderer.init(mockContext)
            let drawCallCount = 0
            mockGl.drawArrays = () => {
                drawCallCount++
            }

            const obj = {
                debugGizmos: {origin: true},
                worldMatrix: [1, 0, 0, 1, 0, 0],
                getBounds: () => ({minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10})
            }
            renderer.renderGizmos(obj, 1)

            expect(drawCallCount).toBeGreaterThan(0)
        })

    })


    test('renderBounds draws lines for bounds rectangle', () => {
        renderer.init(mockContext)
        let drawMode = null
        mockGl.drawArrays = (mode) => {
            drawMode = mode
        }

        const m = [1, 0, 0, 1, 0, 0]
        const bounds = {minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10}
        renderer.renderBounds(m, bounds, 1)

        expect(drawMode).toBe(mockGl.LINES)
    })


    test('renderAnchor draws lines and circle for anchor', () => {
        renderer.init(mockContext)
        let drawCallCount = 0
        mockGl.drawArrays = () => {
            drawCallCount++
        }

        const m = [1, 0, 0, 1, 0, 0]
        const obj = {anchorX: 0.5, anchorY: 0.5}
        const bounds = {minX: 0, minY: 0, width: 10, height: 10}
        renderer.renderAnchor(m, obj, bounds, 1)

        expect(drawCallCount).toBe(2)
    })


    test('renderPivot draws lines and circle outline for pivot', () => {
        renderer.init(mockContext)
        let drawCallCount = 0
        mockGl.drawArrays = () => {
            drawCallCount++
        }

        const m = [1, 0, 0, 1, 0, 0]
        const obj = {pivotX: 5, pivotY: 5}
        renderer.renderPivot(m, obj, 1)

        expect(drawCallCount).toBe(2)
    })


    test('renderOrigin draws axis lines and center circle', () => {
        renderer.init(mockContext)
        let drawCallCount = 0
        mockGl.drawArrays = () => {
            drawCallCount++
        }

        const m = [1, 0, 0, 1, 0, 0]
        renderer.renderOrigin(m, 1)

        expect(drawCallCount).toBe(2)
    })


    describe('drawLines', () => {

        test('binds buffer and uploads vertex data', () => {
            renderer.init(mockContext)
            let bufferBound = false
            let dataUploaded = false
            mockGl.bindBuffer = () => {
                bufferBound = true
            }
            mockGl.bufferData = () => {
                dataUploaded = true
            }

            const vertices = [0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1]
            renderer.drawLines(vertices)

            expect(bufferBound).toBe(true)
            expect(dataUploaded).toBe(true)
        })


        test('sets up vertex attributes', () => {
            renderer.init(mockContext)
            let attribsEnabled = 0
            mockGl.enableVertexAttribArray = () => {
                attribsEnabled++
            }

            const vertices = [0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1]
            renderer.drawLines(vertices)

            expect(attribsEnabled).toBe(2)
        })


        test('draws with LINES mode', () => {
            renderer.init(mockContext)
            let drawMode = null
            mockGl.drawArrays = (mode) => {
                drawMode = mode
            }

            const vertices = [0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1]
            renderer.drawLines(vertices)

            expect(drawMode).toBe(mockGl.LINES)
        })

    })


    describe('drawCircle', () => {

        test('draws with TRIANGLE_FAN mode', () => {
            renderer.init(mockContext)
            let drawMode = null
            mockGl.drawArrays = (mode) => {
                drawMode = mode
            }

            renderer.drawCircle({x: 0, y: 0, radius: 1, color: {r: 1, g: 0, b: 0}, opacity: 1, segments: 8})

            expect(drawMode).toBe(mockGl.TRIANGLE_FAN)
        })


        test('creates correct number of vertices', () => {
            renderer.init(mockContext)
            let vertexCount = 0
            mockGl.drawArrays = (mode, offset, count) => {
                vertexCount = count
            }

            renderer.drawCircle({x: 0, y: 0, radius: 1, color: {r: 1, g: 0, b: 0}, opacity: 1, segments: 8})

            expect(vertexCount).toBe(10)
        })

    })


    test('drawCircleOutline draws with LINES mode', () => {
        renderer.init(mockContext)
        let drawMode = null
        mockGl.drawArrays = (mode) => {
            drawMode = mode
        }

        renderer.drawCircleOutline({x: 0, y: 0, radius: 1, color: {r: 1, g: 0, b: 0}, opacity: 1, segments: 8})

        expect(drawMode).toBe(mockGl.LINES)
    })


    describe('dispose', () => {

        test('deletes vertex buffer', () => {
            renderer.init(mockContext)
            let bufferDeleted = false
            mockGl.deleteBuffer = () => {
                bufferDeleted = true
            }
            renderer.dispose()
            expect(bufferDeleted).toBe(true)
        })


        test('clears gizmo objects', () => {
            renderer.init(mockContext)
            renderer.collectGizmo({}, 1)
            renderer.dispose()

            renderer.init(mockContext)
            let useProgramCalled = false
            mockGl.useProgram = () => {
                useProgramCalled = true
            }
            renderer.flush({projectionMatrix: [], viewMatrix: []})

            expect(useProgramCalled).toBe(false)
        })


        test('clears context reference', () => {
            renderer.init(mockContext)
            renderer.dispose()
            expect(renderer.context).toBeNull()
        })

    })

})
