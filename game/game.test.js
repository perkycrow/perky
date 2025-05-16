import Game from './game'
import {vi, beforeEach, afterEach, describe, test, expect} from 'vitest'


describe(Game, () => {
    let game


    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        game = new Game()
    })


    afterEach(() => {
        vi.restoreAllMocks()
        delete global.ResizeObserver
    })


    test('constructor', () => {
        game = new Game({
            fps: 30,
            maxFrameSkip: 3
        })

        expect(game.gameLoop.fps).toBe(30)
    })


    test('paused', () => {
        game.gameLoop = {
            paused: true
        }

        expect(game.paused).toBe(true)

        game.gameLoop.paused = false
        expect(game.paused).toBe(false)
    })


    test('pause', () => {
        game.start()
        expect(game.paused).toBe(false)
        expect(game.pause()).toBe(true)
        expect(game.paused).toBe(true)
    })


    test('pause when not running', () => {
        expect(game.pause()).toBe(false)
    })


    test('resume', () => {
        game.start()
        game.pause()

        expect(game.resume()).toBe(true)
        expect(game.running).toBe(true)
    })


    test('resume when not started', () => {
        expect(game.resume()).toBe(false)
    })


    test('resume when not paused', () => {
        game.start()
        expect(game.resume()).toBe(false)
    })


    test('setFps', () => {
        game.setFps(30)
        expect(game.gameLoop.fps).toBe(30)
    })


    test('getFps', () => {
        expect(game.getFps()).toBe(60)
    })


    test('getCurrentFps', () => {
        game.gameLoop.currentFps = 59
        expect(game.getCurrentFps()).toBe(59)
    })


    test('events', () => {
        const update = vi.fn()
        const render = vi.fn()
        const pause = vi.fn()
        const resume = vi.fn()
        const changedFps = vi.fn()

        game.on('update', update)
        game.on('render', render)
        game.on('pause', pause)
        game.on('resume', resume)
        game.on('changed:fps', changedFps)

        game.gameLoop.emit('update')
        expect(update).toHaveBeenCalled()

        game.gameLoop.emit('render')
        expect(render).toHaveBeenCalled()

        game.gameLoop.emit('pause')
        expect(pause).toHaveBeenCalled()

        game.gameLoop.emit('resume')
        expect(resume).toHaveBeenCalled()

        game.gameLoop.emit('changed:fps')
        expect(changedFps).toHaveBeenCalled()
    })

})
