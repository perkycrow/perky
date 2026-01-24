import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './animation_preview.js'


function createMockAnimation () {
    return {
        currentFrame: {
            region: {
                width: 32,
                height: 32,
                x: 0,
                y: 0,
                image: null
            }
        },
        currentIndex: 0,
        play: vi.fn(),
        pause: vi.fn(),
        stop: vi.fn(),
        update: vi.fn(),
        seekToFrame: vi.fn(function (index) {
            this.currentIndex = index
        })
    }
}


describe('AnimationPreview', () => {

    let preview
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        preview = document.createElement('animation-preview')
        container.appendChild(preview)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(preview).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(preview.shadowRoot).not.toBeNull()
        })


        test('renders canvas', () => {
            const canvas = preview.shadowRoot.querySelector('.preview-canvas')
            expect(canvas).not.toBeNull()
            expect(canvas.width).toBe(128)
            expect(canvas.height).toBe(128)
        })


        test('renders play button', () => {
            const playBtn = preview.shadowRoot.querySelector('.play-btn')
            expect(playBtn).not.toBeNull()
        })


        test('renders stop button', () => {
            const stopBtn = preview.shadowRoot.querySelector('.stop-btn')
            expect(stopBtn).not.toBeNull()
        })

    })


    describe('setAnimation', () => {

        test('accepts an animation', () => {
            const animation = createMockAnimation()
            expect(() => preview.setAnimation(animation)).not.toThrow()
        })


        test('stops current animation when setting new one', () => {
            const animation1 = createMockAnimation()
            const animation2 = createMockAnimation()

            preview.setAnimation(animation1)
            preview.play()
            preview.setAnimation(animation2)

            expect(animation1.stop).toHaveBeenCalled()
        })

    })


    describe('playback controls', () => {

        test('isPlaying is false by default', () => {
            expect(preview.isPlaying).toBe(false)
        })


        test('play starts animation', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()

            expect(animation.play).toHaveBeenCalled()
            expect(preview.isPlaying).toBe(true)
        })




        test('pause stops playback', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()
            preview.pause()

            expect(animation.pause).toHaveBeenCalled()
            expect(preview.isPlaying).toBe(false)
        })




        test('stop resets animation', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()
            preview.stop()

            expect(animation.stop).toHaveBeenCalled()
            expect(preview.isPlaying).toBe(false)
        })


        test('play button click toggles playback', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)

            const playBtn = preview.shadowRoot.querySelector('.play-btn')

            playBtn.click()
            expect(preview.isPlaying).toBe(true)

            playBtn.click()
            expect(preview.isPlaying).toBe(false)
        })


        test('stop button click stops playback', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()

            const stopBtn = preview.shadowRoot.querySelector('.stop-btn')
            stopBtn.click()

            expect(preview.isPlaying).toBe(false)
        })

    })


    describe('events', () => {

        test('dispatches play event', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)

            const handler = vi.fn()
            preview.addEventListener('play', handler)
            preview.play()

            expect(handler).toHaveBeenCalled()
        })


        test('dispatches pause event', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()

            const handler = vi.fn()
            preview.addEventListener('pause', handler)
            preview.pause()

            expect(handler).toHaveBeenCalled()
        })


        test('dispatches stop event', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)

            const handler = vi.fn()
            preview.addEventListener('stop', handler)
            preview.stop()

            expect(handler).toHaveBeenCalled()
        })

    })


    describe('currentIndex', () => {

        test('returns 0 when no animation', () => {
            expect(preview.currentIndex).toBe(0)
        })


        test('returns animation currentIndex', () => {
            const animation = createMockAnimation()
            animation.currentIndex = 3
            preview.setAnimation(animation)

            expect(preview.currentIndex).toBe(3)
        })

    })


    test('stops playback on disconnect', () => {
        const animation = createMockAnimation()
        preview.setAnimation(animation)
        preview.play()

        preview.remove()

        expect(preview.isPlaying).toBe(false)
    })


    describe('setCurrentIndex', () => {

        test('seeks animation to frame', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)

            preview.setCurrentIndex(2)

            expect(animation.seekToFrame).toHaveBeenCalledWith(2)
        })


        test('dispatches frame event', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)

            const handler = vi.fn()
            preview.addEventListener('frame', handler)

            preview.setCurrentIndex(2)

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.index).toBe(2)
        })


        test('does nothing when no animation', () => {
            expect(() => preview.setCurrentIndex(2)).not.toThrow()
        })

    })

})
