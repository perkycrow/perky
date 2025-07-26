import GamePlugin from './game_plugin'
import Engine from '../core/engine'
import Application from '../application/application'
import {vi, beforeEach, afterEach, describe, test, expect} from 'vitest'


describe(GamePlugin, () => {
    let gamePlugin
    let engine


    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        engine = new Engine()
        gamePlugin = new GamePlugin()
    })


    afterEach(() => {
        vi.restoreAllMocks()
        delete global.ResizeObserver
    })


    test('constructor with default options', () => {
        expect(gamePlugin.name).toBe('game')
        expect(gamePlugin.options.fps).toBeUndefined()
        expect(gamePlugin.options.maxFrameSkip).toBeUndefined()
    })


    test('uses default values when installed', () => {
        gamePlugin.install(engine)
        
        expect(engine.gameLoop.fps).toBe(60)
        expect(engine.gameLoop.maxFrameSkip).toBe(5)
    })


    test('constructor with custom options', () => {
        const customPlugin = new GamePlugin({
            fps: 30,
            maxFrameSkip: 3
        })

        expect(customPlugin.options.fps).toBe(30)
        expect(customPlugin.options.maxFrameSkip).toBe(3)
    })


    test('install adds gameLoop module', () => {
        const registerModuleSpy = vi.spyOn(engine, 'registerModule')
        
        gamePlugin.install(engine)

        expect(registerModuleSpy).toHaveBeenCalledWith('gameLoop', expect.any(Object))
        expect(engine.gameLoop).toBeDefined()
        expect(engine.gameLoop.fps).toBe(60)
    })


    test('install adds paused property', () => {
        gamePlugin.install(engine)

        expect(engine.paused).toBeDefined()
        expect(typeof engine.paused).toBe('boolean')
    })


    test('install adds game methods', () => {
        gamePlugin.install(engine)

        expect(typeof engine.pause).toBe('function')
        expect(typeof engine.resume).toBe('function')
        expect(typeof engine.setFps).toBe('function')
        expect(typeof engine.getFps).toBe('function')
        expect(typeof engine.getCurrentFps).toBe('function')
    })


    test('paused property reflects gameLoop state', () => {
        gamePlugin.install(engine)
        engine.gameLoop.paused = true

        expect(engine.paused).toBe(true)

        engine.gameLoop.paused = false
        expect(engine.paused).toBe(false)
    })


    test('pause method', () => {
        gamePlugin.install(engine)
        engine.start()

        expect(engine.paused).toBe(false)
        expect(engine.pause()).toBe(true)
        expect(engine.paused).toBe(true)
    })


    test('pause when not running', () => {
        gamePlugin.install(engine)

        expect(engine.pause()).toBe(false)
    })


    test('resume method', () => {
        gamePlugin.install(engine)
        engine.start()
        engine.pause()

        expect(engine.resume()).toBe(true)
        expect(engine.running).toBe(true)
    })


    test('resume when not started', () => {
        gamePlugin.install(engine)

        expect(engine.resume()).toBe(false)
    })


    test('resume when not paused', () => {
        gamePlugin.install(engine)
        engine.start()

        expect(engine.resume()).toBe(false)
    })


    test('setFps method', () => {
        gamePlugin.install(engine)

        engine.setFps(30)
        expect(engine.gameLoop.fps).toBe(30)
    })


    test('getFps method', () => {
        gamePlugin.install(engine)

        expect(engine.getFps()).toBe(60)
    })


    test('getCurrentFps method', () => {
        gamePlugin.install(engine)
        engine.gameLoop.currentFps = 59

        expect(engine.getCurrentFps()).toBe(59)
    })


    test('events propagation', () => {
        const update = vi.fn()
        const render = vi.fn()
        const pause = vi.fn()
        const resume = vi.fn()
        const changedFps = vi.fn()

        gamePlugin.install(engine)

        engine.on('update', update)
        engine.on('render', render)
        engine.on('pause', pause)
        engine.on('resume', resume)
        engine.on('changed:fps', changedFps)

        // Simulate gameLoop events
        engine.gameLoop.emit('update', 0.016)
        expect(update).toHaveBeenCalledWith(0.016)

        engine.gameLoop.emit('render', 0.5, 60)
        expect(render).toHaveBeenCalledWith(0.5, 60)

        engine.gameLoop.emit('pause')
        expect(pause).toHaveBeenCalled()

        engine.gameLoop.emit('resume')
        expect(resume).toHaveBeenCalled()

        engine.gameLoop.emit('changed:fps', 30)
        expect(changedFps).toHaveBeenCalledWith(30)
    })


    test('uninstall cleans up properly', () => {
        gamePlugin.install(engine)

        expect(engine.gameLoop).toBeDefined()
        expect(typeof engine.pause).toBe('function')

        gamePlugin.uninstall()

        expect(gamePlugin.engine).toBeNull()
        expect(gamePlugin.installed).toBe(false)
    })


    test('multiple installations should not conflict', () => {
        const plugin1 = new GamePlugin({fps: 30})
        const plugin2 = new GamePlugin({fps: 120})
        
        const engine1 = new Engine()
        const engine2 = new Engine()

        plugin1.install(engine1)
        plugin2.install(engine2)

        expect(engine1.getFps()).toBe(30)
        expect(engine2.getFps()).toBe(120)
    })


    test('plugin works with Engine plugin system', () => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        const pluginEngine = new Application({
            plugins: [new GamePlugin({fps: 45})]
        })

        expect(pluginEngine.getFps()).toBe(45)
        expect(typeof pluginEngine.pause).toBe('function')
        expect(typeof pluginEngine.resume).toBe('function')
        
        global.ResizeObserver = undefined
    })

}) 