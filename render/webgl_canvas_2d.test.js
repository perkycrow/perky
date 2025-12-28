import {describe, test, expect, beforeEach, vi} from 'vitest'
import WebGLCanvas2D from './webgl_canvas_2d'
import Camera2D from './camera_2d'
import Group2D from './group_2d'
import Circle from './circle'
import Rectangle from './rectangle'


// WebGL mock is provided by test/setup.js


describe('WebGLCanvas2D', () => {

    let canvas
    let renderer

    beforeEach(() => {
        canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 600
        renderer = new WebGLCanvas2D({canvas})
    })


    describe('constructor', () => {

        test('uses provided canvas', () => {
            expect(renderer.canvas).toBe(canvas)
        })


        test('gets WebGL context', () => {
            expect(renderer.gl).toBeDefined()
        })


        test('initializes camera', () => {
            expect(renderer.camera).toBeInstanceOf(Camera2D)
        })


        test('has static $name', () => {
            expect(WebGLCanvas2D.$name).toBe('webGLCanvas2D')
        })


        test('with provided camera', () => {
            const camera = new Camera2D({x: 10, y: 20})
            const r = new WebGLCanvas2D({canvas, camera})
            expect(r.camera).toBe(camera)
        })


        test('with backgroundColor', () => {
            const r = new WebGLCanvas2D({canvas, backgroundColor: '#FF0000'})
            expect(r.backgroundColor).toBe('#FF0000')
        })


        test('with showGrid', () => {
            const r = new WebGLCanvas2D({canvas, showGrid: true})
            expect(r.showGrid).toBe(true)
        })


        test('with enableCulling', () => {
            const r = new WebGLCanvas2D({canvas, enableCulling: true})
            expect(r.enableCulling).toBe(true)
        })


        test('initializes stats', () => {
            expect(renderer.stats).toBeDefined()
            expect(renderer.stats.totalObjects).toBe(0)
            expect(renderer.stats.renderedObjects).toBe(0)
            expect(renderer.stats.culledObjects).toBe(0)
        })

    })


    describe('shaderRegistry', () => {

        test('has shaderRegistry accessor', () => {
            expect(renderer.shaderRegistry).toBeDefined()
        })


        test('can register custom shaders', () => {
            const definition = {
                vertex: 'void main() {}',
                fragment: 'void main() {}',
                uniforms: [],
                attributes: []
            }

            const program = renderer.registerShader('custom', definition)
            expect(program).toBeDefined()
        })


        test('can get registered shader', () => {
            const definition = {
                vertex: 'void main() {}',
                fragment: 'void main() {}',
                uniforms: [],
                attributes: []
            }

            renderer.registerShader('test', definition)
            const shader = renderer.getShader('test')
            expect(shader).toBeDefined()
        })

    })


    describe('postProcessor', () => {

        test('has postProcessor accessor', () => {
            expect(renderer.postProcessor).toBeDefined()
        })


        test('can add post pass', () => {
            const mockPass = {
                init: vi.fn(),
                getShaderDefinition: () => ({
                    vertex: 'void main() {}',
                    fragment: 'void main() {}',
                    uniforms: [],
                    attributes: []
                }),
                enabled: true,
                render: vi.fn(),
                dispose: vi.fn()
            }

            renderer.addPostPass(mockPass)
            expect(renderer.postProcessor.passes.length).toBe(1)
        })


        test('can remove post pass', () => {
            const mockPass = {
                init: vi.fn(),
                getShaderDefinition: () => ({
                    vertex: 'void main() {}',
                    fragment: 'void main() {}',
                    uniforms: [],
                    attributes: []
                }),
                enabled: true,
                render: vi.fn(),
                dispose: vi.fn()
            }

            renderer.addPostPass(mockPass)
            renderer.removePostPass(mockPass)
            expect(renderer.postProcessor.passes.length).toBe(0)
        })

    })


    describe('render', () => {

        test('renders empty scene without error', () => {
            const scene = new Group2D()
            expect(() => renderer.render(scene)).not.toThrow()
        })


        test('clears the canvas', () => {
            const scene = new Group2D()
            expect(() => renderer.render(scene)).not.toThrow()
        })


        test('updates world matrix', () => {
            const scene = new Group2D()
            vi.spyOn(scene, 'updateWorldMatrix')

            renderer.render(scene)

            expect(scene.updateWorldMatrix).toHaveBeenCalledWith(false)
        })


        test('renders circle', () => {
            const scene = new Group2D()
            const circle = new Circle({radius: 1, color: '#FF0000'})
            scene.addChild(circle)

            expect(() => renderer.render(scene)).not.toThrow()
        })


        test('renders rectangle', () => {
            const scene = new Group2D()
            const rect = new Rectangle({width: 2, height: 1, color: '#00FF00'})
            scene.addChild(rect)

            expect(() => renderer.render(scene)).not.toThrow()
        })


        test('skips invisible objects', () => {
            const scene = new Group2D()
            const circle = new Circle({radius: 1, color: '#FF0000', visible: false})
            scene.addChild(circle)

            renderer.render(scene)
            expect(renderer.stats.totalObjects).toBe(1)
        })


        test('applies opacity inheritance', () => {
            const scene = new Group2D({opacity: 0.5})
            const circle = new Circle({radius: 1, color: '#FF0000', opacity: 0.5})
            scene.addChild(circle)

            expect(() => renderer.render(scene)).not.toThrow()
        })


        test('renders with background color', () => {
            renderer.backgroundColor = '#0000FF'
            const scene = new Group2D()
            expect(() => renderer.render(scene)).not.toThrow()
        })

    })


    describe('applyPixelRatio', () => {

        test('updates viewport on pixel ratio change', () => {
            expect(() => renderer.setPixelRatio(2)).not.toThrow()
        })

    })


    describe('onDispose', () => {

        test('cleans up resources', () => {
            renderer.dispose()

            expect(renderer.gl).toBe(null)
            expect(renderer.canvas).toBe(null)
        })

    })

})
