import {describe, test, expect, beforeEach, vi, afterEach} from 'vitest'
import SpriteAnimation, {
    PLAYBACK_FORWARD,
    PLAYBACK_REVERSE,
    PLAYBACK_PINGPONG
} from './sprite_animation.js'

describe('SpriteAnimation', () => {
    let sprite
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

        sprite = {
            region: null
        }

        frames = [
            {region: 'region1'},
            {region: 'region2'},
            {region: 'region3'}
        ]

        animation = new SpriteAnimation({
            sprite,
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

        animation.update(0.1)
        expect(animation.currentIndex).toBe(1)
        expect(sprite.region).toBe('region2')

        animation.update(0.1)
        expect(animation.currentIndex).toBe(2)
        expect(sprite.region).toBe('region3')

        vi.unstubAllGlobals()
    })

    test('loops when enabled', () => {
        vi.stubGlobal('performance', {now: () => 1000})
        animation.play()

        animation.update(0.1)
        animation.update(0.1)
        expect(animation.currentIndex).toBe(2)

        const loopSpy = vi.fn()
        animation.on('loop', loopSpy)

        animation.update(0.1)
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

        animation.update(0.1)
        animation.update(0.1)
        animation.update(0.1)

        expect(animation.playing).toBe(false)
        expect(animation.completed).toBe(true)
        expect(completeSpy).toHaveBeenCalled()

        vi.unstubAllGlobals()
    })

    test('setFrame sets frame by index', () => {
        animation.setFrame(2)
        expect(animation.currentIndex).toBe(2)
        expect(sprite.region).toBe('region3')
    })

    test('setFrameByName sets frame by name', () => {
        const namedFrames = [
            {name: 'frame1', region: 'region1'},
            {name: 'frame2', region: 'region2'},
            {name: 'frame3', region: 'region3'}
        ]
        const namedAnimation = new SpriteAnimation({
            sprite,
            frames: namedFrames,
            fps: 10
        })
        namedAnimation.setFrameByName(namedFrames[1])
        expect(namedAnimation.currentIndex).toBe(1)
        expect(sprite.region).toBe('region2')
        namedAnimation.dispose()
    })


    test('pause stops playing', () => {
        vi.stubGlobal('requestAnimationFrame', vi.fn())
        const pauseSpy = vi.fn()
        animation.on('pause', pauseSpy)

        animation.play()
        expect(animation.playing).toBe(true)

        animation.pause()

        expect(animation.playing).toBe(false)
        expect(pauseSpy).toHaveBeenCalled()

        vi.unstubAllGlobals()
    })


    test('stop resets animation to start', () => {
        vi.stubGlobal('performance', {now: () => 1000})
        const stopSpy = vi.fn()
        animation.on('stop', stopSpy)

        animation.play()
        animation.update(0.1)
        expect(animation.currentIndex).toBe(1)

        animation.stop()

        expect(animation.currentIndex).toBe(0)
        expect(animation.playing).toBe(false)
        expect(animation.completed).toBe(false)
        expect(stopSpy).toHaveBeenCalled()

        vi.unstubAllGlobals()
    })


    test('restart stops and plays animation', () => {
        vi.stubGlobal('requestAnimationFrame', vi.fn())
        vi.stubGlobal('performance', {now: () => 1000})

        animation.play()
        animation.update(0.1)
        expect(animation.currentIndex).toBe(1)

        animation.restart()

        expect(animation.currentIndex).toBe(0)
        expect(animation.playing).toBe(true)

        vi.unstubAllGlobals()
    })


    test('nextFrame advances to next frame', () => {
        animation.setFrame(0)

        animation.nextFrame()
        expect(animation.currentIndex).toBe(1)

        animation.nextFrame()
        expect(animation.currentIndex).toBe(2)

        animation.nextFrame()
        expect(animation.currentIndex).toBe(0)
    })


    test('previousFrame goes to previous frame', () => {
        animation.setFrame(2)

        animation.previousFrame()
        expect(animation.currentIndex).toBe(1)

        animation.previousFrame()
        expect(animation.currentIndex).toBe(0)

        animation.previousFrame()
        expect(animation.currentIndex).toBe(2)
    })


    test('setFps updates fps', () => {
        const fpsSpy = vi.fn()
        animation.on('fpsChanged', fpsSpy)

        animation.setFps(30)

        expect(animation.fps).toBe(30)
        expect(fpsSpy).toHaveBeenCalledWith(30)
    })


    test('playback mode constants are exported', () => {
        expect(PLAYBACK_FORWARD).toBe('forward')
        expect(PLAYBACK_REVERSE).toBe('reverse')
        expect(PLAYBACK_PINGPONG).toBe('pingpong')
    })


    test('getFrameDuration returns base duration for frames without custom duration', () => {
        const duration = animation.getFrameDuration(0)
        expect(duration).toBe(0.1)
    })


    test('getFrameDuration returns scaled duration for frames with custom duration', () => {
        const customFrames = [
            {region: 'region1', duration: 2},
            {region: 'region2'},
            {region: 'region3', duration: 0.5}
        ]
        const customAnimation = new SpriteAnimation({
            sprite,
            frames: customFrames,
            fps: 10
        })

        expect(customAnimation.getFrameDuration(0)).toBe(0.2)
        expect(customAnimation.getFrameDuration(1)).toBe(0.1)
        expect(customAnimation.getFrameDuration(2)).toBe(0.05)

        customAnimation.dispose()
    })


    test('setSpeed updates speed', () => {
        animation.setSpeed(2)
        expect(animation.speed).toBe(2)

        animation.setSpeed(0.5)
        expect(animation.speed).toBe(0.5)
    })


    test('setPlaybackMode updates playback mode', () => {
        animation.setPlaybackMode(PLAYBACK_REVERSE)
        expect(animation.playbackMode).toBe(PLAYBACK_REVERSE)

        animation.setPlaybackMode(PLAYBACK_PINGPONG)
        expect(animation.playbackMode).toBe(PLAYBACK_PINGPONG)

        animation.setPlaybackMode(PLAYBACK_FORWARD)
        expect(animation.playbackMode).toBe(PLAYBACK_FORWARD)
    })


    describe('events', () => {

        test('addEvent adds event to frame', () => {
            animation.addEvent(1, 'footstep')
            expect(animation.getEvents(1)).toEqual(['footstep'])
        })


        test('addEvent adds multiple events to same frame', () => {
            animation.addEvent(1, 'footstep')
            animation.addEvent(1, 'sound')
            expect(animation.getEvents(1)).toEqual(['footstep', 'sound'])
        })


        test('removeEvent removes specific event from frame', () => {
            animation.addEvent(1, 'footstep')
            animation.addEvent(1, 'sound')

            animation.removeEvent(1, 'footstep')

            expect(animation.getEvents(1)).toEqual(['sound'])
        })


        test('removeEvent does nothing for non-existent frame', () => {
            animation.removeEvent(99, 'footstep')
            expect(animation.getEvents(99)).toEqual([])
        })


        test('removeEvent removes frame entry when no events remain', () => {
            animation.addEvent(1, 'footstep')
            animation.removeEvent(1, 'footstep')

            expect(animation.getEvents(1)).toEqual([])
        })


        test('clearEvents removes all events', () => {
            animation.addEvent(0, 'start')
            animation.addEvent(1, 'footstep')
            animation.addEvent(2, 'end')

            animation.clearEvents()

            expect(animation.getEvents(0)).toEqual([])
            expect(animation.getEvents(1)).toEqual([])
            expect(animation.getEvents(2)).toEqual([])
        })


        test('getEvents returns empty array for frame without events', () => {
            expect(animation.getEvents(0)).toEqual([])
        })

    })


    describe('seek methods', () => {

        test('seekToFrame sets frame and resets elapsed time', () => {
            animation.seekToFrame(2)
            expect(animation.currentIndex).toBe(2)
            expect(sprite.region).toBe('region3')
        })


        test('seekToFrame does nothing for invalid index', () => {
            animation.seekToFrame(0)
            animation.seekToFrame(-1)
            expect(animation.currentIndex).toBe(0)

            animation.seekToFrame(99)
            expect(animation.currentIndex).toBe(0)
        })


        test('seekToProgress seeks to frame based on progress', () => {
            animation.seekToProgress(0)
            expect(animation.currentIndex).toBe(0)

            animation.seekToProgress(0.5)
            expect(animation.currentIndex).toBe(1)

            animation.seekToProgress(1)
            expect(animation.currentIndex).toBe(2)
        })


        test('seekToProgress clamps progress to valid range', () => {
            animation.seekToProgress(-0.5)
            expect(animation.currentIndex).toBe(0)

            animation.seekToProgress(1.5)
            expect(animation.currentIndex).toBe(2)
        })

    })
})
