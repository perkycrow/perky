import SpriteAnimation from './sprite_animation.js'
import PerkyModule from '../core/perky_module.js'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('SpriteAnimation', () => {

    let animation
    let mockSprite
    let frames


    beforeEach(() => {
        vi.useFakeTimers()
        
        mockSprite = {
            material: {
                map: null,
                needsUpdate: false
            }
        }
        
        frames = ['frame1', 'frame2', 'frame3', 'frame4']
        
        global.performance = {
            now: vi.fn(() => 0)
        }
        
        global.requestAnimationFrame = vi.fn().mockReturnValue(123)
        global.cancelAnimationFrame = vi.fn()
        
        animation = new SpriteAnimation(mockSprite, frames)
    })


    afterEach(() => {
        vi.restoreAllMocks()
        vi.useRealTimers()
    })


    test('constructor with default options', () => {
        expect(animation).toBeInstanceOf(PerkyModule)
        expect(animation.sprite).toBe(mockSprite)
        expect(animation.frames).toEqual(frames)
        expect(animation.fps).toBe(12)
        expect(animation.loop).toBe(true)
        expect(animation.autoStart).toBe(false)
        expect(animation.currentIndex).toBe(0)
        expect(animation.playing).toBe(false)
        expect(animation.completed).toBe(false)
    })


    test('constructor with custom options', () => {
        const customAnimation = new SpriteAnimation(mockSprite, frames, {
            fps: 24,
            loop: false,
            autoStart: true
        })
        
        expect(customAnimation.fps).toBe(24)
        expect(customAnimation.loop).toBe(false)
        expect(customAnimation.autoStart).toBe(true)
        expect(customAnimation.playing).toBe(true)
    })


    test('getters', () => {
        expect(animation.frameInterval).toBe(1000 / 12)
        expect(animation.totalFrames).toBe(4)
        expect(animation.currentFrame).toBe('frame1')
        expect(animation.progress).toBe(0)
        
        animation.currentIndex = 2
        expect(animation.progress).toBe(0.5)
    })


    test('play starts animation', () => {
        const playSpy = vi.spyOn(animation, 'emit')
        
        const result = animation.play()
        
        expect(result).toBe(animation)
        expect(animation.playing).toBe(true)
        expect(animation.completed).toBe(false)
        expect(playSpy).toHaveBeenCalledWith('play')
        expect(global.requestAnimationFrame).toHaveBeenCalled()
    })


    test('play does nothing if already playing', () => {
        animation.playing = true
        global.requestAnimationFrame.mockClear()
        
        animation.play()
        
        expect(global.requestAnimationFrame).not.toHaveBeenCalled()
    })


    test('play does nothing if no frames', () => {
        const emptyAnimation = new SpriteAnimation(mockSprite, [])
        
        emptyAnimation.play()
        
        expect(emptyAnimation.playing).toBe(false)
    })


    test('pause stops animation', () => {
        animation.play()
        const pauseSpy = vi.spyOn(animation, 'emit')
        
        const result = animation.pause()
        
        expect(result).toBe(animation)
        expect(animation.playing).toBe(false)
        expect(pauseSpy).toHaveBeenCalledWith('pause')
        expect(global.cancelAnimationFrame).toHaveBeenCalledWith(123)
    })


    test('pause does nothing if not playing', () => {
        const pauseSpy = vi.spyOn(animation, 'emit')
        
        const result = animation.pause()
        
        expect(result).toBe(animation)
        expect(animation.playing).toBe(false)
        expect(pauseSpy).not.toHaveBeenCalled()
        expect(global.cancelAnimationFrame).not.toHaveBeenCalled()
    })


    test('stop resets animation', () => {
        animation.currentIndex = 2
        animation.playing = true
        const stopSpy = vi.spyOn(animation, 'emit')
        
        const result = animation.stop()
        
        expect(result).toBe(animation)
        expect(animation.playing).toBe(false)
        expect(animation.currentIndex).toBe(0)
        expect(animation.completed).toBe(false)
        expect(stopSpy).toHaveBeenCalledWith('stop')
        expect(mockSprite.material.map).toBe('frame1') // Should be set to first frame
    })


    test('restart stops and plays', () => {
        const stopSpy = vi.spyOn(animation, 'stop')
        const playSpy = vi.spyOn(animation, 'play')
        
        animation.restart()
        
        expect(stopSpy).toHaveBeenCalled()
        expect(playSpy).toHaveBeenCalled()
    })


    test('setFrame updates current frame', () => {
        const frameChangedSpy = vi.spyOn(animation, 'emit')
        
        const result = animation.setFrame(2)
        
        expect(result).toBe(animation)
        expect(animation.currentIndex).toBe(2)
        expect(mockSprite.material.map).toBe('frame3') // Should be set to the correct frame
        expect(frameChangedSpy).toHaveBeenCalledWith('frameChanged', 'frame3', 2)
    })


    test('setFrame ignores invalid index', () => {
        const originalMap = mockSprite.material.map
        
        animation.setFrame(-1)
        animation.setFrame(10)
        
        expect(animation.currentIndex).toBe(0)
        expect(mockSprite.material.map).toBe(originalMap) // Should not change
    })


    test('setFrameByName finds frame by name', () => {
        const result = animation.setFrameByName('frame3')
        
        expect(result).toBe(animation)
        expect(animation.currentIndex).toBe(2)
    })


    test('setFrameByName ignores unknown frame', () => {
        animation.setFrameByName('unknownFrame')
        
        expect(animation.currentIndex).toBe(0)
    })


    test('nextFrame advances to next frame', () => {
        animation.nextFrame()
        expect(animation.currentIndex).toBe(1)

        animation.currentIndex = 3
        animation.nextFrame()
        expect(animation.currentIndex).toBe(0)
    })


    test('previousFrame goes to previous frame', () => {
        animation.currentIndex = 2
        animation.previousFrame()
        expect(animation.currentIndex).toBe(1)

        animation.currentIndex = 0
        animation.previousFrame()
        expect(animation.currentIndex).toBe(3)
    })


    test('setFps updates fps', () => {
        const fpsSpy = vi.spyOn(animation, 'emit')
        
        const result = animation.setFps(24)
        
        expect(result).toBe(animation)
        expect(animation.fps).toBe(24)
        expect(fpsSpy).toHaveBeenCalledWith('fpsChanged', 24)
    })


    test('setLoop updates loop setting', () => {
        const result = animation.setLoop(false)
        
        expect(result).toBe(animation)
        expect(animation.loop).toBe(false)
    })

    test('dispose cleans up resources', () => {
        animation.playing = true
        const pauseSpy = vi.spyOn(animation, 'pause')
        const superDisposeSpy = vi.spyOn(PerkyModule.prototype, 'dispose')
        
        animation.dispose()
        
        expect(pauseSpy).toHaveBeenCalled()
        expect(animation.sprite).toBeNull()
        expect(animation.frames).toEqual([])
        expect(superDisposeSpy).toHaveBeenCalled()
    })

})
