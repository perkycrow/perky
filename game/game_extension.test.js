import GameExtension from './game_extension'
import Engine from '../core/engine'
import {vi, beforeEach, afterEach, describe, test, expect} from 'vitest'


describe(GameExtension, () => {
    let gameExtension
    let engine


    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        engine = new Engine()
        gameExtension = new GameExtension()
    })


    afterEach(() => {
        vi.restoreAllMocks()
        delete global.ResizeObserver
    })


    test('constructor with default options', () => {
        expect(gameExtension.name).toBe('game')
        expect(gameExtension.options.fps).toBeUndefined()
        expect(gameExtension.options.maxFrameSkip).toBeUndefined()
    })


    test('uses default values when installed', () => {
        engine.use(GameExtension)
        gameExtension = engine.getExtension('game')
        
        expect(gameExtension.gameLoop.fps).toBe(60)
        expect(gameExtension.gameLoop.maxFrameSkip).toBe(5)
    })


    test('constructor with custom options', () => {
        const customExtension = new GameExtension({
            fps: 30,
            maxFrameSkip: 3
        })

        expect(customExtension.options.fps).toBe(30)
        expect(customExtension.options.maxFrameSkip).toBe(3)
    })


    test('use adds gameLoop module', () => {
        engine.use(GameExtension)

        gameExtension = engine.getExtension('game')
        expect(gameExtension.gameLoop).toBeDefined()
        expect(gameExtension.gameLoop.fps).toBe(60)
    })


    test('use adds paused property', () => {
        engine.use(GameExtension)

        expect(engine.paused).toBeDefined()
        expect(typeof engine.paused).toBe('boolean')
    })


    test('use adds game methods', () => {
        engine.use(GameExtension)

        expect(typeof engine.pause).toBe('function')
        expect(typeof engine.resume).toBe('function')
        expect(typeof engine.setFps).toBe('function')
        expect(typeof engine.getFps).toBe('function')
        expect(typeof engine.getCurrentFps).toBe('function')
    })


    test('paused property reflects gameLoop state', () => {
        engine.use(GameExtension)
        gameExtension = engine.getExtension('game')
        gameExtension.gameLoop.paused = true

        expect(engine.paused).toBe(true)

        gameExtension.gameLoop.paused = false
        expect(engine.paused).toBe(false)
    })


    test('pause method', () => {
        engine.use(GameExtension)
        engine.start()

        expect(engine.paused).toBe(false)
        expect(engine.pause()).toBe(true)
        expect(engine.paused).toBe(true)
    })


    test('pause when not running', () => {
        engine.use(GameExtension)

        expect(engine.pause()).toBe(false)
    })


    test('resume method', () => {
        engine.use(GameExtension)
        engine.start()
        engine.pause()

        expect(engine.resume()).toBe(true)
        expect(engine.running).toBe(true)
    })


    test('resume when not started', () => {
        engine.use(GameExtension)

        expect(engine.resume()).toBe(false)
    })


    test('resume when not paused', () => {
        engine.use(GameExtension)
        engine.start()

        expect(engine.resume()).toBe(false)
    })


    test('setFps method', () => {
        engine.use(GameExtension)
        gameExtension = engine.getExtension('game')

        engine.setFps(30)
        expect(gameExtension.gameLoop.fps).toBe(30)
    })


    test('getFps method', () => {
        engine.use(GameExtension)

        expect(engine.getFps()).toBe(60)
    })


    test('getCurrentFps method', () => {
        engine.use(GameExtension)
        gameExtension = engine.getExtension('game')
        gameExtension.gameLoop.currentFps = 59

        expect(engine.getCurrentFps()).toBe(59)
    })


    test('events propagation', () => {
        const update = vi.fn()
        const render = vi.fn()
        const pause = vi.fn()
        const resume = vi.fn()
        const changedFps = vi.fn()

        engine.use(GameExtension)
        gameExtension = engine.getExtension('game')

        engine.on('update', update)
        engine.on('render', render)
        engine.on('pause', pause)
        engine.on('resume', resume)
        engine.on('changed:fps', changedFps)

        gameExtension.gameLoop.emit('update', 0.016)
        expect(update).toHaveBeenCalledWith(0.016)

        gameExtension.gameLoop.emit('render', 0.5, 60)
        expect(render).toHaveBeenCalledWith(0.5, 60)

        gameExtension.gameLoop.emit('pause')
        expect(pause).toHaveBeenCalled()

        gameExtension.gameLoop.emit('resume')
        expect(resume).toHaveBeenCalled()

        gameExtension.gameLoop.emit('changed:fps', 30)
        expect(changedFps).toHaveBeenCalledWith(30)
    })


    test('uninstall cleans up properly', () => {
        engine.use(GameExtension)

        const extension = engine.getExtension('game')
        expect(extension.gameLoop).toBeDefined()
        expect(typeof engine.pause).toBe('function')

        extension.uninstall()

        expect(extension.host).toBeNull()
        expect(extension.installed).toBe(false)
    })


    test('multiple installations should not conflict', () => {
        const engine1 = new Engine()
        const engine2 = new Engine()

        engine1.use(GameExtension, {fps: 30})
        engine2.use(GameExtension, {fps: 120})

        expect(engine1.getFps()).toBe(30)
        expect(engine2.getFps()).toBe(120)
    })


    test('extension can be used with use() method', () => {
        const testEngine = new Engine()
        testEngine.use(GameExtension, {fps: 45})

        expect(testEngine.getFps()).toBe(45)
        expect(typeof testEngine.pause).toBe('function')
        expect(typeof testEngine.resume).toBe('function')
    })

}) 