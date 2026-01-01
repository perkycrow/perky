import {describe, test, expect, beforeEach, vi, afterEach} from 'vitest'
import SpriteAnimation2D from './sprite_animation_2d.js'

describe('SpriteAnimation2D', () => {
    let spritesheet
    let animation
    let frames

    beforeEach(() => {
        vi.useFakeTimers({
            toFake: ['setTimeout', 'clearTimeout', 'performance', 'Date']
        })

        vi.stubGlobal('requestAnimationFrame', (cb) => setTimeout(cb, 16))
        vi.stubGlobal('cancelAnimationFrame', (id) => clearTimeout(id))

        vi.stubGlobal('performance', {
            now: () => Date.now()
        })

        spritesheet = {
            setFrame: vi.fn()
        }

        frames = ['frame1', 'frame2', 'frame3']

        animation = new SpriteAnimation2D({
            sprite: spritesheet,
            frames,
            fps: 10,
            loop: true,
            autoStart: false
        })
    })

    afterEach(() => {
        animation.dispose()
    })

    test('initializes with correct values', () => {
        expect(animation.totalFrames).toBe(3)
        expect(animation.fps).toBe(10)
        expect(animation.loop).toBe(true)
        expect(animation.playing).toBe(false)
    })

    test('play starts animation', () => {
        const playSpy = vi.fn()
        animation.on('play', playSpy)

        vi.stubGlobal('requestAnimationFrame', vi.fn())

        animation.play()

        expect(animation.playing).toBe(true)
        expect(playSpy).toHaveBeenCalled()

        vi.unstubAllGlobals()
    })

    test('update advances frames', () => {
        expect(animation.currentIndex).toBe(0)

        vi.stubGlobal('performance', {now: () => 1000})
        animation.play()

        animation.update(1100)
        expect(animation.currentIndex).toBe(1)
        expect(spritesheet.setFrame).toHaveBeenCalledWith('frame2')

        animation.update(1200)
        expect(animation.currentIndex).toBe(2)
        expect(spritesheet.setFrame).toHaveBeenCalledWith('frame3')

        vi.unstubAllGlobals()
    })

    test('loops when enabled', () => {
        vi.stubGlobal('performance', {now: () => 1000})
        animation.play()

        animation.update(1100)
        animation.update(1200)
        expect(animation.currentIndex).toBe(2)

        const loopSpy = vi.fn()
        animation.on('loop', loopSpy)

        animation.update(1300)
        expect(animation.currentIndex).toBe(0)
        expect(loopSpy).toHaveBeenCalled()

        vi.unstubAllGlobals()
    })

    test('stops at end when loop disabled', () => {
        animation.setLoop(false)

        vi.stubGlobal('performance', {now: () => 1000})
        animation.play()

        const completeSpy = vi.fn()
        animation.on('complete', completeSpy)

        animation.update(1100)
        animation.update(1200)
        animation.update(1300)

        expect(animation.playing).toBe(false)
        expect(animation.completed).toBe(true)
        expect(completeSpy).toHaveBeenCalled()

        vi.unstubAllGlobals()
    })

    test('setFrame sets frame by index', () => {
        animation.setFrame(2)
        expect(animation.currentIndex).toBe(2)
        expect(spritesheet.setFrame).toHaveBeenCalledWith('frame3')
    })

    test('setFrameByName sets frame by name', () => {
        animation.setFrameByName('frame2')
        expect(animation.currentIndex).toBe(1)
        expect(spritesheet.setFrame).toHaveBeenCalledWith('frame2')
    })
})
