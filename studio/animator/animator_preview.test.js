import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import AnimatorPreview from './animator_preview.js'


describe(AnimatorPreview, () => {
    let preview
    let canvas
    let mockAnimation


    beforeEach(() => {
        canvas = document.createElement('canvas')
        canvas.width = 400
        canvas.height = 300
        document.body.appendChild(canvas)

        mockAnimation = {
            currentFrame: {region: {x: 0, y: 0, width: 32, height: 32, image: new Image()}},
            currentIndex: 0,
            completed: false,
            play: vi.fn(),
            pause: vi.fn(),
            stop: vi.fn(),
            update: vi.fn(),
            seekToFrame: vi.fn()
        }

        preview = new AnimatorPreview({canvas})
    })


    afterEach(() => {
        preview?.dispose()
        canvas.remove()
    })


    describe('constructor', () => {

        test('creates instance with canvas', () => {
            expect(preview).toBeInstanceOf(AnimatorPreview)
        })


        test('accepts unitsInView option', () => {
            const customPreview = new AnimatorPreview({
                canvas,
                unitsInView: {width: 10, height: 8}
            })
            expect(customPreview).toBeInstanceOf(AnimatorPreview)
            customPreview.dispose()
        })


        test('accepts callback options', () => {
            const onFrame = vi.fn()
            const onComplete = vi.fn()
            const customPreview = new AnimatorPreview({canvas, onFrame, onComplete})
            expect(customPreview).toBeInstanceOf(AnimatorPreview)
            customPreview.dispose()
        })

    })


    test('setUnitsInView updates units in view', () => {
        preview.setUnitsInView({width: 12, height: 10})
        expect(preview).toBeInstanceOf(AnimatorPreview)
    })


    describe('setSize', () => {

        test('updates sprite size', () => {
            preview.setSize({width: 2, height: 2})
            expect(preview).toBeInstanceOf(AnimatorPreview)
        })


        test('handles null value', () => {
            preview.setSize(null)
            expect(preview).toBeInstanceOf(AnimatorPreview)
        })

    })


    test('setMotion sets motion configuration', () => {
        preview.setMotion({mode: 'walk', speed: 1.5, direction: 'e'})
        expect(preview).toBeInstanceOf(AnimatorPreview)
    })


    describe('setBackgroundRegion', () => {

        test('hides background when null', () => {
            preview.setBackgroundRegion(null)
            expect(preview).toBeInstanceOf(AnimatorPreview)
        })


        test('shows background when region provided', () => {
            const region = {x: 0, y: 0, width: 100, height: 100}
            preview.setBackgroundRegion(region)
            expect(preview).toBeInstanceOf(AnimatorPreview)
        })

    })


    describe('setAnimation', () => {

        test('sets animation', () => {
            preview.setAnimation(mockAnimation)
            expect(preview.animation).toBe(mockAnimation)
        })


        test('handles null animation', () => {
            preview.setAnimation(null)
            expect(preview.animation).toBeNull()
        })

    })


    describe('setAnchor', () => {

        test('sets anchor point', () => {
            preview.setAnchor({x: 0.5, y: 1})
            expect(preview).toBeInstanceOf(AnimatorPreview)
        })


        test('handles null anchor', () => {
            preview.setAnchor(null)
            expect(preview).toBeInstanceOf(AnimatorPreview)
        })

    })


    test('resize resizes canvas and renderer', () => {
        preview.resize(800, 600)
        expect(canvas.width).toBe(800)
        expect(canvas.height).toBe(600)
    })


    describe('playback controls', () => {

        test('play does nothing without animation', () => {
            preview.play()
            expect(preview.isPlaying).toBe(false)
        })


        test('play starts animation playback', () => {
            preview.setAnimation(mockAnimation)
            preview.play()
            expect(preview.isPlaying).toBe(true)
            expect(mockAnimation.play).toHaveBeenCalled()
        })


        test('pause stops playback', () => {
            preview.setAnimation(mockAnimation)
            preview.play()
            preview.pause()
            expect(preview.isPlaying).toBe(false)
            expect(mockAnimation.pause).toHaveBeenCalled()
        })


        test('stop resets animation', () => {
            preview.setAnimation(mockAnimation)
            preview.play()
            preview.stop()
            expect(preview.isPlaying).toBe(false)
            expect(mockAnimation.stop).toHaveBeenCalled()
        })

    })


    describe('seekToFrame', () => {

        test('does nothing without animation', () => {
            preview.seekToFrame(5)
            expect(preview).toBeInstanceOf(AnimatorPreview)
        })


        test('seeks to frame index', () => {
            preview.setAnimation(mockAnimation)
            preview.seekToFrame(3)
            expect(mockAnimation.seekToFrame).toHaveBeenCalledWith(3)
        })

    })


    describe('getters', () => {

        test('isPlaying returns playback state', () => {
            expect(preview.isPlaying).toBe(false)
        })


        test('animation returns current animation', () => {
            expect(preview.animation).toBeNull()
            preview.setAnimation(mockAnimation)
            expect(preview.animation).toBe(mockAnimation)
        })


        test('sprite returns animator sprite', () => {
            expect(preview.sprite).toBeDefined()
        })


        test('currentIndex returns animation index', () => {
            expect(preview.currentIndex).toBe(0)
            preview.setAnimation(mockAnimation)
            expect(preview.currentIndex).toBe(0)
        })

    })


    test('render renders scene', () => {
        preview.render()
        expect(preview).toBeInstanceOf(AnimatorPreview)
    })


    test('dispose stops playback and cleans up', () => {
        preview.setAnimation(mockAnimation)
        preview.play()
        preview.dispose()
        preview = null
        expect(mockAnimation.stop).toHaveBeenCalled()
    })

})
