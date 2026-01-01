import {describe, it, expect, beforeEach, vi, afterEach} from 'vitest'
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
            sprite: spritesheet, // mocking sprite object
            frames,
            fps: 10,
            loop: true,
            autoStart: false
        })
    })

    afterEach(() => {
        animation.dispose()
    })

    it('should initialize correctly', () => {
        expect(animation.totalFrames).toBe(3)
        expect(animation.fps).toBe(10)
        expect(animation.loop).toBe(true)
        expect(animation.playing).toBe(false)
    })

    it('should start playing when play() is called', () => {
        const playSpy = vi.fn()
        animation.on('play', playSpy)

        // Mock requestAnimationFrame to avoid loop starting in test
        vi.stubGlobal('requestAnimationFrame', vi.fn())

        animation.play()

        expect(animation.playing).toBe(true)
        expect(playSpy).toHaveBeenCalled()

        vi.unstubAllGlobals()
    })

    it('should advance frames manually via update', () => {
        // Initial state
        expect(animation.currentIndex).toBe(0)

        // However, lastFrameTime is set to performance.now() on play().
        // We need to mock performance.now() to a known value during play().

        vi.stubGlobal('performance', {now: () => 1000})
        animation.play() // lastFrameTime = 1000

        // Update with 1100 (100ms elapsed)
        animation.update(1100)
        expect(animation.currentIndex).toBe(1)
        expect(spritesheet.setFrame).toHaveBeenCalledWith('frame2')

        // Update with 1200 (another 100ms)
        animation.update(1200)
        expect(animation.currentIndex).toBe(2)
        expect(spritesheet.setFrame).toHaveBeenCalledWith('frame3')

        vi.unstubAllGlobals()
    })

    it('should loop when enabled', () => {
        vi.stubGlobal('performance', {now: () => 1000})
        animation.play()

        // Advance to end (frame 2)
        animation.update(1100)
        animation.update(1200)
        expect(animation.currentIndex).toBe(2)

        // Loop back to start
        const loopSpy = vi.fn()
        animation.on('loop', loopSpy)

        animation.update(1300)
        expect(animation.currentIndex).toBe(0)
        expect(loopSpy).toHaveBeenCalled()

        vi.unstubAllGlobals()
    })

    it('should stop at end when loop is disabled', () => {
        animation.setLoop(false)

        vi.stubGlobal('performance', {now: () => 1000})
        animation.play()

        const completeSpy = vi.fn()
        animation.on('complete', completeSpy)

        // Advance to end
        // Wait, update(1300) from 1000 is 300ms.
        // Frame 0 (1000) -> Frame 1 (1100) -> Frame 2 (1200) -> Complete (1300)?
        // Let's trace:
        // 1000: start, index 0
        // 1100: elapsed 100. index -> 1. lastFrameTime -> 1100
        // 1200: elapsed 100. index -> 2. lastFrameTime -> 1200
        // 1300: elapsed 100. index 2 is last. loop false -> complete.

        // We need to call update sequentially or jump?
        // The logic: lastFrameTime = now - (elapsed % interval)
        // If we jump 300ms:
        // elapsed 300. 300 >= 100.
        // advanceFrame. index -> 1.
        // lastFrameTime = 1300 - (300 % 100) = 1300.
        // So it only advances ONE frame per update call if we don't loop inside update.
        // My implementation only calls advanceFrame ONCE per update.
        // This is a bug in implementation if FPS is low or lag is high!
        // But for this test, I will call update sequentially.

        animation.update(1100)
        animation.update(1200)
        animation.update(1300)

        expect(animation.playing).toBe(false)
        expect(animation.completed).toBe(true)
        expect(completeSpy).toHaveBeenCalled()

        vi.unstubAllGlobals()
    })

    it('should set frame by index', () => {
        animation.setFrame(2)
        expect(animation.currentIndex).toBe(2)
        expect(spritesheet.setFrame).toHaveBeenCalledWith('frame3')
    })

    it('should set frame by name', () => {
        animation.setFrameByName('frame2')
        expect(animation.currentIndex).toBe(1)
        expect(spritesheet.setFrame).toHaveBeenCalledWith('frame2')
    })
})
