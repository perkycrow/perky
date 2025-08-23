import GameLoop from './game_loop'
import PerkyModule from '../core/perky_module'
import {vi, beforeEach, afterEach, describe, test, expect} from 'vitest'


describe('GameLoop', () => {
    let gameLoop
    let originalRequestAnimationFrame
    let originalPerformanceNow
    let animationCallbacks = []

    beforeEach(() => {
        originalRequestAnimationFrame = global.requestAnimationFrame
        originalPerformanceNow = global.performance.now
        animationCallbacks = []

        let time = 0
        global.performance.now = vi.fn(() => {
            time += 16.7 // ~60fps
            return time
        })

        global.requestAnimationFrame = vi.fn(callback => {
            animationCallbacks.push(callback)
            return 1 // Return a dummy ID
        })

        vi.spyOn(PerkyModule.prototype, 'emit')
        
        gameLoop = new GameLoop()
    })


    afterEach(() => {
        vi.restoreAllMocks()
        global.requestAnimationFrame = originalRequestAnimationFrame
        global.performance.now = originalPerformanceNow
        animationCallbacks = []
    })


    test('constructor', () => {
        expect(gameLoop).toBeInstanceOf(PerkyModule)
        expect(gameLoop.frameInterval).toBe(1000 / 60)
        expect(gameLoop.paused).toBe(false)
        expect(gameLoop.maxFrameSkip).toBe(5)
    })


    test('constructor with custom params', () => {
        const customLoop = new GameLoop({
            fps: 30,
            maxFrameSkip: 3
        })

        expect(customLoop.frameInterval).toBe(1000 / 30)
        expect(customLoop.maxFrameSkip).toBe(3)
    })


    test('running getter', () => {
        expect(gameLoop.running).toBe(false)

        gameLoop.started = true
        expect(gameLoop.running).toBe(true)
        
        gameLoop.paused = true
        expect(gameLoop.running).toBe(false)
    })


    test('start', () => {
        gameLoop.start('param')
        
        expect(gameLoop.started).toBe(true)
        expect(gameLoop.lastTime).toBeDefined()
        expect(gameLoop.accumulator).toBe(0)
        expect(gameLoop.frameCount).toBe(0)
        expect(global.requestAnimationFrame).toHaveBeenCalled()
    })


    test('start with already started', () => {
        gameLoop.started = true
        
        const result = gameLoop.start()
        
        expect(result).toBe(false)
        expect(requestAnimationFrame).not.toHaveBeenCalled()
    })


    test('pause', () => {
        gameLoop.started = true
        gameLoop.paused = false
        
        const result = gameLoop.pause('param')
        
        expect(result).toBe(true)
        expect(gameLoop.paused).toBe(true)
        expect(gameLoop.emit).toHaveBeenCalledWith('pause', 'param')
    })


    test('pause when not running', () => {
        vi.clearAllMocks()

        const result = gameLoop.pause()

        expect(result).toBe(false)
        expect(gameLoop.emit).not.toHaveBeenCalled()
    })


    test('resume', () => {
        gameLoop.started = true
        gameLoop.paused = true
        
        const result = gameLoop.resume('param')
        
        expect(result).toBe(true)
        expect(gameLoop.paused).toBe(false)
        expect(gameLoop.emit).toHaveBeenCalledWith('resume', 'param')
        expect(requestAnimationFrame).toHaveBeenCalled()
    })


    test('resume when not paused', () => {
        vi.clearAllMocks()

        gameLoop.started = true
        gameLoop.paused = false
        
        const result = gameLoop.resume()
        
        expect(result).toBe(false)
        expect(gameLoop.emit).not.toHaveBeenCalled()
    })


    test('setFps and getFps', () => {
        gameLoop.setFps(30)
        
        expect(gameLoop.frameInterval).toBe(1000 / 30)
        expect(gameLoop.getFps()).toBe(30)
    })


    test('getCurrentFps', () => {
        expect(gameLoop.getCurrentFps()).toBe(0)
        
        gameLoop.currentFps = 59
        expect(gameLoop.getCurrentFps()).toBe(59)
    })


    test('update function emits events', () => {
        const testLoop = new GameLoop()
        const update = vi.fn()
        const render = vi.fn()

        testLoop.on('update', update)
        testLoop.on('render', render)

        testLoop.start()
        expect(animationCallbacks.length).toBeGreaterThan(0)

        testLoop.lastTime = performance.now() - 50 // 50ms ago

        const updateFn = animationCallbacks[0]
        updateFn(performance.now())

        expect(update).toHaveBeenCalled()
        
        expect(render).toHaveBeenCalled()
    })

    test('update function with paused loop', () => {
        const testLoop = new GameLoop()
        const update = vi.fn()
        const render = vi.fn()

        testLoop.on('update', update)
        testLoop.on('render', render)

        testLoop.start()
        expect(animationCallbacks.length).toBeGreaterThan(0)

        testLoop.paused = true

        const updateFn = animationCallbacks[0]
        const result = updateFn(performance.now())

        expect(result).toBe(false)
        expect(update).not.toHaveBeenCalled()
        expect(render).not.toHaveBeenCalled()
    })

})
