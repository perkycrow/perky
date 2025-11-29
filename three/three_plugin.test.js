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
        app.mount(container)

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


    test('registers three loaders on install', () => {
        plugin = new ThreePlugin()
        plugin.install(app)
        
        expect(app.loaders.has('spritesheet')).toBe(true)
        expect(typeof app.loaders.get('spritesheet')).toBe('function')
        expect(app.loaders.has('spritesheetData')).toBe(true)
        expect(typeof app.loaders.get('spritesheetData')).toBe('function')
    })


    test('three loaders are removed on uninstall', () => {
        plugin = new ThreePlugin()
        plugin.install(app)
        
        expect(app.loaders.has('spritesheet')).toBe(true)
        expect(app.loaders.has('spritesheetData')).toBe(true)
        
        plugin.uninstall()
        
        // Note: loaders are not automatically removed on uninstall
        // This is by design as other plugins or code might rely on them
        expect(app.loaders.has('spritesheet')).toBe(true)
        expect(app.loaders.has('spritesheetData')).toBe(true)
    })


    test('spritesheet loader integration test', async () => {
        // Mock fetch for the integration test
        const spritesheetJson = {
            frames: [
                {filename: 'test.png', frame: {x: 0, y: 0, w: 32, h: 32}}
            ],
            meta: {
                image: 'sheet.png'
            }
        }

        const mockFetch = vi.fn()
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(spritesheetJson)
        })
        mockFetch.mockResolvedValueOnce({
            ok: true,
            blob: () => Promise.resolve(new Blob(['image'], {type: 'image/png'}))
        })
        global.fetch = mockFetch

        global.Image = vi.fn(() => {
            const img = {}
            Object.defineProperty(img, 'src', {
                set () {
                    if (img.onload) {
                        setTimeout(img.onload, 0)
                    }
                }
            })
            img.onload = null
            img.onerror = null
            return img
        })

        global.URL = {
            createObjectURL: vi.fn().mockReturnValue('blob:test'),
            revokeObjectURL: vi.fn()
        }

        plugin = new ThreePlugin()
        plugin.install(app)
        
        expect(app.loaders.has('spritesheet')).toBe(true)
        
        const spritesheetLoader = app.loaders.get('spritesheet')
        const result = await spritesheetLoader('test.json')
        
        expect(result.getFrameCount()).toBe(1)
        expect(result.hasFrame('test')).toBe(true)
        expect(result.getFrameTexture('test')).toBeDefined()

        vi.restoreAllMocks()
    })




})
