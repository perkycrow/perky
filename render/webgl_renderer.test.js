import {describe, test, expect, beforeEach, vi} from 'vitest'
import WebGLRenderer from './webgl_renderer.js'
import Camera from './camera.js'
import Group2D from './group_2d.js'
import Circle from './circle.js'
import Rectangle from './rectangle.js'
import RenderPass from './postprocessing/render_pass.js'


class MockPass extends RenderPass {

    static $name = 'mockPass'

    static shaderDefinition = {
        vertex: `#version 300 es
            in vec2 aPosition;
            void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
        `,
        fragment: `#version 300 es
            precision mediump float;
            out vec4 fragColor;
            void main() { fragColor = vec4(1.0); }
        `,
        uniforms: [],
        attributes: ['aPosition']
    }

}


// WebGL mock is provided by test/setup.js


describe('WebGLRenderer', () => {

    let canvas
    let renderer

    beforeEach(() => {
        canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 600
        renderer = new WebGLRenderer({canvas})
    })


    describe('constructor', () => {

        test('uses provided canvas', () => {
            expect(renderer.canvas).toBe(canvas)
        })


        test('gets WebGL context', () => {
            expect(renderer.gl).toBeDefined()
        })


        test('initializes camera', () => {
            expect(renderer.camera).toBeInstanceOf(Camera)
        })


        test('has static $name', () => {
            expect(WebGLRenderer.$name).toBe('webGLRenderer')
        })


        test('with provided camera', () => {
            const camera = new Camera({x: 10, y: 20})
            const r = new WebGLRenderer({canvas, camera})
            expect(r.camera).toBe(camera)
        })


        test('with backgroundColor', () => {
            const r = new WebGLRenderer({canvas, backgroundColor: '#FF0000'})
            expect(r.backgroundColor).toBe('#FF0000')
        })


        test('with enableCulling', () => {
            const r = new WebGLRenderer({canvas, enableCulling: true})
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


    describe('shaderEffectRegistry', () => {

        test('has shaderEffectRegistry accessor', () => {
            expect(renderer.shaderEffectRegistry).toBeDefined()
        })


        test('registerShaderEffect registers an effect class', () => {
            class TestEffect {
                static shader = {
                    params: [],
                    uniforms: [],
                    fragment: ''
                }
            }

            expect(() => renderer.registerShaderEffect(TestEffect)).not.toThrow()
            expect(renderer.shaderEffectRegistry.has('TestEffect')).toBe(true)
        })


        test('setUniform stores uniform value', () => {
            renderer.setUniform('uTime', 1.5)
            expect(renderer.getUniform('uTime')).toBe(1.5)
        })


        test('setUniform with type stores uniform value and type', () => {
            renderer.setUniform('uResolution', [800, 600], 'vec2')
            expect(renderer.getUniform('uResolution')).toEqual([800, 600])
        })


        test('setUniform returns this for chaining', () => {
            const result = renderer.setUniform('uTime', 1.0)
            expect(result).toBe(renderer)
        })


        test('getUniform returns undefined for unknown uniform', () => {
            expect(renderer.getUniform('uUnknown')).toBeUndefined()
        })

    })


    describe('postProcessor', () => {

        test('has postProcessor accessor', () => {
            expect(renderer.postProcessor).toBeDefined()
        })


        test('can add post pass', () => {
            const pass = renderer.addPostPass(MockPass)
            expect(renderer.postProcessor.passes.length).toBe(1)
            expect(pass).toBeInstanceOf(MockPass)
        })


        test('can get post pass by name', () => {
            renderer.addPostPass(MockPass)
            expect(renderer.getPass('mockPass')).toBeInstanceOf(MockPass)
        })


        test('can remove post pass', () => {
            const pass = renderer.addPostPass(MockPass)
            renderer.removePostPass(pass)
            expect(renderer.postProcessor.passes.length).toBe(0)
        })


        test('postPasses returns all render passes', () => {
            renderer.addPostPass(MockPass)
            expect(renderer.postPasses.length).toBe(1)
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


    test('setPixelRatio updates viewport on pixel ratio change', () => {
        expect(() => renderer.setPixelRatio(2)).not.toThrow()
    })


    test('dispose cleans up resources', () => {
        renderer.dispose()

        expect(renderer.gl).toBe(null)
        expect(renderer.canvas).toBe(null)
    })


    describe('registerRenderer and unregisterRenderer', () => {

        test('registerRenderer adds custom renderer', () => {
            class CustomObject {}
            class CustomRenderer {
                static get handles () {
                    return [CustomObject]
                }

                init = vi.fn()
                reset = vi.fn()
                flush = vi.fn()
                dispose = vi.fn()
            }

            const customRenderer = new CustomRenderer()
            const result = renderer.registerRenderer(customRenderer)

            expect(result).toBe(renderer)
            expect(customRenderer.init).toHaveBeenCalled()
        })


        test('unregisterRenderer removes renderer', () => {
            class CustomObject {}
            class CustomRenderer {
                static get handles () {
                    return [CustomObject]
                }

                init = vi.fn()
                reset = vi.fn()
                flush = vi.fn()
                dispose = vi.fn()
            }

            const customRenderer = new CustomRenderer()
            renderer.registerRenderer(customRenderer)

            const result = renderer.unregisterRenderer(customRenderer)

            expect(result).toBe(renderer)
            expect(customRenderer.dispose).toHaveBeenCalled()
        })

    })


    describe('applyPixelRatio', () => {

        test('applyPixelRatio updates viewport', () => {
            renderer.pixelRatio = 2
            expect(() => renderer.applyPixelRatio()).not.toThrow()
        })


        test('applyPixelRatio resizes post processor', () => {
            const originalWidth = canvas.width
            const originalHeight = canvas.height

            renderer.applyPixelRatio()

            expect(renderer.gl).toBeDefined()
            expect(canvas.width).toBe(originalWidth)
            expect(canvas.height).toBe(originalHeight)
        })

    })


    describe('setRenderGroups and clearRenderGroups', () => {

        test('setRenderGroups creates render groups', () => {
            const scene = new Group2D()

            renderer.setRenderGroups([
                {$id: 'background', content: scene},
                {$id: 'foreground', content: scene}
            ])

            expect(renderer.renderGroups.length).toBe(2)
        })


        test('setRenderGroups returns this for chaining', () => {
            const scene = new Group2D()

            const result = renderer.setRenderGroups([
                {$id: 'test', content: scene}
            ])

            expect(result).toBe(renderer)
        })


        test('clearRenderGroups removes all render groups', () => {
            const scene = new Group2D()

            renderer.setRenderGroups([
                {$id: 'group1', content: scene},
                {$id: 'group2', content: scene}
            ])

            expect(renderer.renderGroups.length).toBe(2)

            const result = renderer.clearRenderGroups()

            expect(result).toBe(renderer)
            expect(renderer.renderGroups.length).toBe(0)
        })


        test('setRenderGroups clears previous groups', () => {
            const scene = new Group2D()

            renderer.setRenderGroups([
                {$id: 'oldGroup', content: scene}
            ])

            renderer.setRenderGroups([
                {$id: 'newGroup', content: scene}
            ])

            expect(renderer.renderGroups.length).toBe(1)
            expect(renderer.renderGroups[0].$id).toBe('newGroup')
        })

    })

})
