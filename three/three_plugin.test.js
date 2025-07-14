import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import Application from '../application/application'
import ThreePlugin from './three_plugin'
import {Scene, Color} from 'three'

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}))

vi.mock('./renderers/webgl_renderer', () => ({
    default: class MockWebGLRenderer {
        constructor () {
            this.domElement = document.createElement('canvas')
        }
        render = vi.fn()
        setSize = vi.fn()
        dispose = vi.fn()
    }
}))

vi.mock('./effects/render_composer', () => ({
    default: class MockRenderComposer {
        constructor () {}
        render = vi.fn()
        setSize = vi.fn()
        insertPass = vi.fn()
    }
}))


describe('ThreePlugin', () => {
    let app
    let plugin

    beforeEach(() => {
        app = new Application()

        const container = document.createElement('div')
        document.body.appendChild(container)
        app.mountTo(container)

        Object.defineProperty(app.perkyView.element, 'clientWidth', {
            value: 800,
            configurable: true
        })

        Object.defineProperty(app.perkyView.element, 'clientHeight', {
            value: 600,
            configurable: true
        })
    })


    afterEach(() => {
        if (plugin && plugin.installed) {
            plugin.uninstall()
        }

        document.body.innerHTML = ''
    })


    test('creates plugin with default options', () => {
        plugin = new ThreePlugin()
        
        expect(plugin.name).toBe('three')
        expect(plugin.scene).toBeNull()
        expect(plugin.camera).toBeNull()
        expect(plugin.renderer).toBeNull()
        expect(plugin.renderComposer).toBeNull()
    })


    test('creates plugin with custom options', () => {
        const options = {
            backgroundColor: 0x87CEEB,
            camera: {
                type: 'perspective',
                fov: 60
            },
            renderer: {
                antialias: false
            }
        }
        
        plugin = new ThreePlugin(options)
        
        expect(plugin.name).toBe('three')
        expect(plugin.options.backgroundColor).toBe(0x87CEEB)
        expect(plugin.options.camera.type).toBe('perspective')
        expect(plugin.options.camera.fov).toBe(60)
        expect(plugin.options.renderer.antialias).toBe(false)
    })


    test('installs plugin and creates Three.js components', () => {
        plugin = new ThreePlugin({
            backgroundColor: 0x87CEEB
        })
        
        plugin.install(app)
        
        expect(plugin.installed).toBe(true)
        expect(plugin.scene).toBeInstanceOf(Scene)
        expect(plugin.scene.background).toBeInstanceOf(Color)
        expect(plugin.camera).toBeDefined()
        expect(plugin.renderer).toBeDefined()
        expect(plugin.renderComposer).toBeDefined()
    })


    test('exposes Three.js objects on app', () => {
        plugin = new ThreePlugin()
        plugin.install(app)
        
        expect(app.scene).toBe(plugin.scene)
        expect(app.camera).toBe(plugin.camera)
        expect(app.renderer).toBe(plugin.renderer)
        expect(app.renderComposer).toBe(plugin.renderComposer)
    })


    test('creates orthographic camera by default', () => {
        plugin = new ThreePlugin()
        plugin.install(app)
        
        expect(plugin.camera.isOrthographicCamera).toBe(true)
        expect(plugin.camera.left).toBe(-10)
        expect(plugin.camera.right).toBe(10)
        expect(plugin.camera.top).toBe(7.5)
        expect(plugin.camera.bottom).toBe(-7.5)
    })


    test('creates perspective camera when specified', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'perspective',
                fov: 60
            }
        })
        plugin.install(app)
        
        expect(plugin.camera.isPerspectiveCamera).toBe(true)
        expect(plugin.camera.fov).toBe(60)
    })


    test('creates orthographic camera with custom options', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'orthographic',
                width: 40,
                height: 30,
                near: 0.5,
                far: 500
            }
        })
        plugin.install(app)
        
        expect(plugin.camera.isOrthographicCamera).toBe(true)
        expect(plugin.camera.left).toBe(-20)
        expect(plugin.camera.right).toBe(20)
        expect(plugin.camera.top).toBe(15)
        expect(plugin.camera.bottom).toBe(-15)
        expect(plugin.camera.near).toBe(0.5)
        expect(plugin.camera.far).toBe(500)
    })


    test('creates perspective camera with custom options', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'perspective',
                fov: 45,
                near: 0.5,
                far: 2000
            }
        })
        plugin.install(app)
        
        expect(plugin.camera.isPerspectiveCamera).toBe(true)
        expect(plugin.camera.fov).toBe(45)
        expect(plugin.camera.near).toBe(0.5)
        expect(plugin.camera.far).toBe(2000)
    })


    test('skips render composer when postProcessing is false', () => {
        plugin = new ThreePlugin({
            postProcessing: false
        })
        plugin.install(app)
        
        expect(plugin.renderComposer).toBeNull()
        expect(app.renderComposer).toBeUndefined()
    })


    test('adds render method to app', () => {
        plugin = new ThreePlugin()
        plugin.install(app)
        
        expect(typeof app.render).toBe('function')
    })


    test('adds resizeThree method to app', () => {
        plugin = new ThreePlugin()
        plugin.install(app)
        
        expect(typeof app.resizeThree).toBe('function')
    })


    test('adds getThreeContainerSize method to app', () => {
        plugin = new ThreePlugin()
        plugin.install(app)
        
        expect(typeof app.getThreeContainerSize).toBe('function')
        
        const size = app.getThreeContainerSize()
        expect(size.width).toBe(800)
        expect(size.height).toBe(600)
    })


    test('updates orthographic camera on resize', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'orthographic',
                width: 20,
                height: 15
            }
        })
        plugin.install(app)

        Object.defineProperty(app.perkyView.element, 'clientWidth', {
            value: 1600,
            configurable: true
        })
        Object.defineProperty(app.perkyView.element, 'clientHeight', {
            value: 900,
            configurable: true
        })

        app.resizeThree()

        const aspectRatio = 1600 / 900
        const expectedWidth = 15 * aspectRatio
        
        expect(plugin.camera.left).toBeCloseTo(-expectedWidth / 2)
        expect(plugin.camera.right).toBeCloseTo(expectedWidth / 2)
        expect(plugin.camera.top).toBe(7.5)
        expect(plugin.camera.bottom).toBe(-7.5)
    })


    test('updates perspective camera on resize', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'perspective',
                fov: 75
            }
        })
        plugin.install(app)

        Object.defineProperty(app.perkyView.element, 'clientWidth', {
            value: 1600,
            configurable: true
        })
        Object.defineProperty(app.perkyView.element, 'clientHeight', {
            value: 900,
            configurable: true
        })

        app.resizeThree()
        
        expect(plugin.camera.aspect).toBeCloseTo(1600 / 900)
    })


    test('emits three:resize event on resize', () => {
        plugin = new ThreePlugin()
        plugin.install(app)
        
        const resizeHandler = vi.fn()
        app.on('three:resize', resizeHandler)
        
        // Trigger resize
        app.resizeThree()
        
        expect(resizeHandler).toHaveBeenCalledWith({
            width: 800,
            height: 600,
            aspectRatio: 800 / 600
        })
    })


    test('skips resize with invalid dimensions', () => {
        plugin = new ThreePlugin()
        plugin.install(app)
        
        plugin.camera.updateProjectionMatrix = vi.fn()

        Object.defineProperty(app.perkyView.element, 'clientWidth', {
            value: 0,
            configurable: true
        })
        Object.defineProperty(app.perkyView.element, 'clientHeight', {
            value: 0,
            configurable: true
        })

        app.resizeThree()
        
        expect(plugin.camera.updateProjectionMatrix).not.toHaveBeenCalled()
    })


    test('cleans up on uninstall', () => {
        plugin = new ThreePlugin()
        plugin.install(app)
        
        expect(plugin.installed).toBe(true)
        expect(plugin.scene).not.toBeNull()
        expect(plugin.camera).not.toBeNull()
        expect(plugin.renderer).not.toBeNull()
        expect(app.scene).toBeDefined()
        expect(app.camera).toBeDefined()
        expect(app.renderer).toBeDefined()
        
        plugin.uninstall()
        
        expect(plugin.installed).toBe(false)
        expect(plugin.scene).toBeNull()
        expect(plugin.camera).toBeNull()
        expect(plugin.renderer).toBeNull()
        expect(plugin.renderComposer).toBeNull()
        expect(plugin.resizeHandlers).toEqual([])
        expect(app.scene).toBeUndefined()
        expect(app.camera).toBeUndefined()
        expect(app.renderer).toBeUndefined()
    })


    test('render method works with renderComposer', () => {
        plugin = new ThreePlugin()
        plugin.install(app)

        expect(plugin.renderComposer.render).toBeDefined()
        
        app.render()
        
        expect(plugin.renderComposer.render).toHaveBeenCalled()
    })


    test('render method works without renderComposer', () => {
        plugin = new ThreePlugin({
            postProcessing: false
        })
        plugin.install(app)

        expect(plugin.renderer.render).toBeDefined()
        
        app.render()
        
        expect(plugin.renderer.render).toHaveBeenCalledWith(plugin.scene, plugin.camera)
    })


    test('screenToWorld method for orthographic camera', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'orthographic',
                width: 20,
                height: 15
            }
        })
        plugin.install(app)

        expect(typeof app.screenToWorld).toBe('function')

        // Test center of screen
        const centerWorld = app.screenToWorld(400, 300) // Center of 800x600 screen
        expect(centerWorld.x).toBeCloseTo(0, 1)
        expect(centerWorld.y).toBeCloseTo(0, 1)
        expect(centerWorld.z).toBe(0)

        // Test with depth
        const worldWithDepth = app.screenToWorld(400, 300, 5)
        expect(worldWithDepth.z).toBe(5)
    })


    test('screenToWorld method for perspective camera', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'perspective',
                fov: 75
            }
        })
        plugin.install(app)

        // Position camera at z=10 for predictable calculations
        plugin.camera.position.set(0, 0, 10)

        const centerWorld = app.screenToWorld(400, 300) // Center of 800x600 screen
        expect(centerWorld.x).toBeCloseTo(0, 1)
        expect(centerWorld.y).toBeCloseTo(0, 1)
        expect(centerWorld.z).toBe(0)
    })


    test('screenToWorld handles missing camera gracefully', () => {
        plugin = new ThreePlugin()
        plugin.install(app)
        
        const originalCamera = app.camera
        app.camera = null

        const result = app.screenToWorld(400, 300)
        expect(result).toEqual({x: 0, y: 0, z: 0})

        app.camera = originalCamera
    })


    test('screenToWorld with custom camera parameter', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'orthographic',
                width: 40,
                height: 30
            }
        })
        plugin.install(app)

        const customCamera = {
            isOrthographicCamera: true,
            top: 5,
            bottom: -5,
            left: -10,
            right: 10
        }

        const result = app.screenToWorld(400, 300, 0, customCamera)
        expect(result.x).toBeCloseTo(0, 1)
        expect(result.y).toBeCloseTo(0, 1)
        expect(result.z).toBe(0)
    })


    test('worldToScreen method for orthographic camera', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'orthographic',
                width: 20,
                height: 15
            }
        })
        plugin.install(app)

        expect(typeof app.worldToScreen).toBe('function')

        const screenPos = app.worldToScreen(0, 0)
        expect(screenPos.x).toBeCloseTo(400, 1)
        expect(screenPos.y).toBeCloseTo(300, 1)
    })


    test('getViewDimensions method for orthographic camera', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'orthographic',
                width: 20,
                height: 15
            }
        })
        plugin.install(app)

        expect(typeof app.getViewDimensions).toBe('function')

        const dimensions = app.getViewDimensions()
        expect(dimensions.height).toBe(15) // Original height
        expect(dimensions.width).toBeCloseTo(20, 1) // Adjusted for aspect ratio
    })


    test('getScreenBounds method', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'orthographic',
                width: 20,
                height: 15
            }
        })
        plugin.install(app)

        expect(typeof app.getScreenBounds).toBe('function')

        const bounds = app.getScreenBounds()
        expect(bounds.top).toBe(7.5)
        expect(bounds.bottom).toBe(-7.5)
        expect(bounds.left).toBeCloseTo(-10, 1)
        expect(bounds.right).toBeCloseTo(10, 1)
    })


    test('screenToWorld and worldToScreen are inverse operations', () => {
        plugin = new ThreePlugin({
            camera: {
                type: 'orthographic',
                width: 20,
                height: 15
            }
        })
        plugin.install(app)

        // Test round-trip conversion
        const originalWorld = {x: 5, y: 3}
        const screenPos = app.worldToScreen(originalWorld.x, originalWorld.y)
        const backToWorld = app.screenToWorld(screenPos.x, screenPos.y)

        expect(backToWorld.x).toBeCloseTo(originalWorld.x, 2)
        expect(backToWorld.y).toBeCloseTo(originalWorld.y, 2)
    })

})
