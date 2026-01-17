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

        test('should extend HTMLElement', () => {
            expect(preview).toBeInstanceOf(HTMLElement)
        })


        test('should have shadow DOM', () => {
            expect(preview.shadowRoot).not.toBeNull()
        })


        test('should render canvas', () => {
            const canvas = preview.shadowRoot.querySelector('.preview-canvas')
            expect(canvas).not.toBeNull()
            expect(canvas.width).toBe(128)
            expect(canvas.height).toBe(128)
        })


        test('should render play button', () => {
            const playBtn = preview.shadowRoot.querySelector('.play-btn')
            expect(playBtn).not.toBeNull()
            expect(playBtn.textContent).toBe('▶')
        })


        test('should render stop button', () => {
            const stopBtn = preview.shadowRoot.querySelector('.stop-btn')
            expect(stopBtn).not.toBeNull()
            expect(stopBtn.textContent).toBe('⏹')
        })

    })


    describe('setAnimation', () => {

        test('should accept an animation', () => {
            const animation = createMockAnimation()
            expect(() => preview.setAnimation(animation)).not.toThrow()
        })


        test('should stop current animation when setting new one', () => {
            const animation1 = createMockAnimation()
            const animation2 = createMockAnimation()

            preview.setAnimation(animation1)
            preview.play()
            preview.setAnimation(animation2)

            expect(animation1.stop).toHaveBeenCalled()
        })

    })


    describe('playback controls', () => {

        test('isPlaying should be false by default', () => {
            expect(preview.isPlaying).toBe(false)
        })


        test('play should start animation', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()

            expect(animation.play).toHaveBeenCalled()
            expect(preview.isPlaying).toBe(true)
        })


        test('play should change button text to pause', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()

            const playBtn = preview.shadowRoot.querySelector('.play-btn')
            expect(playBtn.textContent).toBe('⏸')
        })


        test('pause should stop playback', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()
            preview.pause()

            expect(animation.pause).toHaveBeenCalled()
            expect(preview.isPlaying).toBe(false)
        })


        test('pause should change button text back to play', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()
            preview.pause()

            const playBtn = preview.shadowRoot.querySelector('.play-btn')
            expect(playBtn.textContent).toBe('▶')
        })


        test('stop should reset animation', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()
            preview.stop()

            expect(animation.stop).toHaveBeenCalled()
            expect(preview.isPlaying).toBe(false)
        })


        test('play button click should toggle playback', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)

            const playBtn = preview.shadowRoot.querySelector('.play-btn')

            playBtn.click()
            expect(preview.isPlaying).toBe(true)

            playBtn.click()
            expect(preview.isPlaying).toBe(false)
        })


        test('stop button click should stop playback', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()

            const stopBtn = preview.shadowRoot.querySelector('.stop-btn')
            stopBtn.click()

            expect(preview.isPlaying).toBe(false)
        })

    })


    describe('events', () => {

        test('should dispatch play event', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)

            const handler = vi.fn()
            preview.addEventListener('play', handler)
            preview.play()

            expect(handler).toHaveBeenCalled()
        })


        test('should dispatch pause event', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)
            preview.play()

            const handler = vi.fn()
            preview.addEventListener('pause', handler)
            preview.pause()

            expect(handler).toHaveBeenCalled()
        })


        test('should dispatch stop event', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)

            const handler = vi.fn()
            preview.addEventListener('stop', handler)
            preview.stop()

            expect(handler).toHaveBeenCalled()
        })

    })


    describe('currentIndex', () => {

        test('should return 0 when no animation', () => {
            expect(preview.currentIndex).toBe(0)
        })


        test('should return animation currentIndex', () => {
            const animation = createMockAnimation()
            animation.currentIndex = 3
            preview.setAnimation(animation)

            expect(preview.currentIndex).toBe(3)
        })

    })


    test('should stop playback on disconnect', () => {
        const animation = createMockAnimation()
        preview.setAnimation(animation)
        preview.play()

        preview.remove()

        expect(preview.isPlaying).toBe(false)
    })


    describe('setCurrentIndex', () => {

        test('should seek animation to frame', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)

            preview.setCurrentIndex(2)

            expect(animation.seekToFrame).toHaveBeenCalledWith(2)
        })


        test('should dispatch frame event', () => {
            const animation = createMockAnimation()
            preview.setAnimation(animation)

            const handler = vi.fn()
            preview.addEventListener('frame', handler)

            preview.setCurrentIndex(2)

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.index).toBe(2)
        })


        test('should do nothing when no animation', () => {
            expect(() => preview.setCurrentIndex(2)).not.toThrow()
        })

    })

})
