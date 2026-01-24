import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './animation_timeline.js'


// Polyfill PointerEvent for jsdom
if (typeof PointerEvent === 'undefined') {
    globalThis.PointerEvent = class PointerEvent extends MouseEvent {
        constructor (type, params) {
            super(type, params)
        }
    }
}


function createMockDataTransfer () {
    const data = {}
    return {
        setData: (type, value) => {
            data[type] = value
        },
        getData: (type) => data[type] || '',
        get types () {
            return Object.keys(data)
        },
        dropEffect: 'none'
    }
}


function createMockFrames () {
    return [
        {region: null},
        {region: null, events: ['hit']},
        {region: null, duration: 2},
        {region: null, events: ['end'], duration: 1.5}
    ]
}


describe('AnimationTimeline', () => {

    let timeline
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        timeline = document.createElement('animation-timeline')
        container.appendChild(timeline)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(timeline).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(timeline.shadowRoot).not.toBeNull()
        })


        test('renders timeline container', () => {
            const timelineEl = timeline.shadowRoot.querySelector('.timeline')
            expect(timelineEl).not.toBeNull()
        })


        test('is empty initially', () => {
            const frames = timeline.shadowRoot.querySelectorAll('.frame')
            expect(frames.length).toBe(0)
        })

    })


    describe('setFrames', () => {

        test('renders frames', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
            expect(frameEls.length).toBe(4)
        })


        test('renders frame indices', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const indexEls = timeline.shadowRoot.querySelectorAll('.frame-index')
            expect(indexEls[0].textContent).toBe('0')
            expect(indexEls[1].textContent).toBe('1')
            expect(indexEls[2].textContent).toBe('2')
            expect(indexEls[3].textContent).toBe('3')
        })


        test('renders frame thumbnails', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const canvases = timeline.shadowRoot.querySelectorAll('.frame-thumbnail')
            expect(canvases.length).toBe(4)
            expect(canvases[0].width).toBe(80)
            expect(canvases[0].height).toBe(80)
        })


        test('renders event badges when present', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const eventBadges = timeline.shadowRoot.querySelectorAll('.frame-event-badge')
            expect(eventBadges.length).toBe(2)
            expect(eventBadges[0].title).toBe('hit')
            expect(eventBadges[1].title).toBe('end')
        })


        test('renders duration badges only for non-default durations', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            // Only frames with duration != 1 should have badges (frames at index 2 and 3)
            const durationBadges = timeline.shadowRoot.querySelectorAll('.frame-duration-badge')
            expect(durationBadges.length).toBe(2)
        })


        test('clears previous frames when setting new ones', () => {
            timeline.setFrames([{region: null}, {region: null}])
            expect(timeline.shadowRoot.querySelectorAll('.frame').length).toBe(2)

            timeline.setFrames([{region: null}])
            expect(timeline.shadowRoot.querySelectorAll('.frame').length).toBe(1)
        })

    })


    describe('setCurrentIndex', () => {

        test('highlights current frame', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            timeline.setCurrentIndex(2)

            const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
            expect(frameEls[0].classList.contains('current')).toBe(false)
            expect(frameEls[1].classList.contains('current')).toBe(false)
            expect(frameEls[2].classList.contains('current')).toBe(true)
            expect(frameEls[3].classList.contains('current')).toBe(false)
        })


        test('updates highlight when index changes', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            timeline.setCurrentIndex(1)
            timeline.setCurrentIndex(3)

            const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
            expect(frameEls[1].classList.contains('current')).toBe(false)
            expect(frameEls[3].classList.contains('current')).toBe(true)
        })


        test('does not update if index is the same', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            timeline.setCurrentIndex(1)
            const frameEl = timeline.shadowRoot.querySelectorAll('.frame')[1]

            timeline.setCurrentIndex(1)

            expect(frameEl.classList.contains('current')).toBe(true)
        })

    })


    describe('events', () => {

        test('dispatches frameselect event on frame click', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const handler = vi.fn()
            timeline.addEventListener('frameselect', handler)

            const frameEl = timeline.shadowRoot.querySelectorAll('.frame')[2]
            frameEl.click()

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.index).toBe(2)
        })


        test('dispatches correct index for each frame', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const indices = []
            timeline.addEventListener('frameselect', (e) => {
                indices.push(e.detail.index)
            })

            const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
            frameEls[0].click()
            frameEls[3].click()
            frameEls[1].click()

            // Click toggles selection, so first click selects 0, second selects 3, third selects 1
            expect(indices).toEqual([0, 3, 1])
        })

    })


    test('sets data-index on frames', () => {
        const frames = createMockFrames()
        timeline.setFrames(frames)

        const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
        expect(frameEls[0].dataset.index).toBe('0')
        expect(frameEls[1].dataset.index).toBe('1')
        expect(frameEls[2].dataset.index).toBe('2')
        expect(frameEls[3].dataset.index).toBe('3')
    })


    describe('drop zone', () => {

        test('has drop indicator element', () => {
            const dropIndicator = timeline.shadowRoot.querySelector('.drop-indicator')
            expect(dropIndicator).not.toBeNull()
        })


        test('dispatches framedrop event on spritesheet drop', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const handler = vi.fn()
            timeline.addEventListener('framedrop', handler)

            const timelineEl = timeline.shadowRoot.querySelector('.timeline')

            const dragOverDataTransfer = createMockDataTransfer()
            dragOverDataTransfer.setData('application/x-spritesheet-frame', '{}')
            const dragOverEvent = new Event('dragover', {bubbles: true, cancelable: true})
            dragOverEvent.dataTransfer = dragOverDataTransfer
            dragOverEvent.clientX = 100
            timelineEl.dispatchEvent(dragOverEvent)

            const dropDataTransfer = createMockDataTransfer()
            dropDataTransfer.setData('application/x-spritesheet-frame', JSON.stringify({
                name: 'walk/1',
                regionData: {x: 0, y: 0, width: 32, height: 32}
            }))
            const dropEvent = new Event('drop', {bubbles: true, cancelable: true})
            dropEvent.dataTransfer = dropDataTransfer
            timelineEl.dispatchEvent(dropEvent)

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.frameName).toBe('walk/1')
        })


        test('adds drag-over class during dragover', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const timelineEl = timeline.shadowRoot.querySelector('.timeline')

            const dragOverDataTransfer = createMockDataTransfer()
            dragOverDataTransfer.setData('application/x-spritesheet-frame', '{}')
            const dragOverEvent = new Event('dragover', {bubbles: true, cancelable: true})
            dragOverEvent.dataTransfer = dragOverDataTransfer
            dragOverEvent.clientX = 100
            timelineEl.dispatchEvent(dragOverEvent)

            expect(timelineEl.classList.contains('drag-over')).toBe(true)
        })

    })


    describe('frame reordering', () => {

        test('has frames that can be dragged', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const frame = timeline.shadowRoot.querySelector('.frame')
            expect(frame).not.toBeNull()
            expect(frame.className).toContain('frame')
        })


        test('adds dragging class after pointer drag threshold', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const frame = timeline.shadowRoot.querySelector('.frame')

            // Start drag with pointerdown
            const pointerDownEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 100,
                clientY: 100,
                button: 0
            })
            frame.dispatchEvent(pointerDownEvent)

            // Move pointer beyond threshold (>10px)
            const pointerMoveEvent = new PointerEvent('pointermove', {
                bubbles: true,
                clientX: 120,
                clientY: 100
            })
            document.dispatchEvent(pointerMoveEvent)

            expect(frame.classList.contains('dragging')).toBe(true)

            // Cleanup
            document.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}))
        })


        test('dispatches framemove event after drag and drop', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const handler = vi.fn()
            timeline.addEventListener('framemove', handler)

            const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
            const firstFrame = frameEls[0]

            // Mock getBoundingClientRect for drop index calculation
            frameEls.forEach((el, i) => {
                el.getBoundingClientRect = () => ({
                    left: 50 + i * 70,
                    width: 60,
                    right: 50 + i * 70 + 60
                })
            })

            // Mock viewport getBoundingClientRect to ensure pointer is recognized as inside
            const viewport = timeline.shadowRoot.querySelector('.timeline-viewport')
            viewport.getBoundingClientRect = () => ({
                left: 0,
                right: 500,
                top: 0,
                bottom: 200
            })

            // Start drag with pointerdown
            const pointerDownEvent = new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 80,
                clientY: 100,
                button: 0
            })
            firstFrame.dispatchEvent(pointerDownEvent)

            // Move beyond threshold to position 3 (past frame 2) so it actually moves
            const pointerMoveEvent = new PointerEvent('pointermove', {
                bubbles: true,
                clientX: 250,
                clientY: 100
            })
            document.dispatchEvent(pointerMoveEvent)

            // End drag
            document.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}))

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.fromIndex).toBe(0)
        })

    })


    describe('frame deletion', () => {

        test('dispatches framedelete event on Delete key when frame is current', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)
            timeline.setCurrentIndex(1)

            const handler = vi.fn()
            timeline.addEventListener('framedelete', handler)

            const keyEvent = new KeyboardEvent('keydown', {key: 'Delete', bubbles: true})
            timeline.dispatchEvent(keyEvent)

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.index).toBe(1)
        })


        test('dispatches framedelete event on Delete key', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)
            timeline.setCurrentIndex(2)

            const handler = vi.fn()
            timeline.addEventListener('framedelete', handler)

            const keyEvent = new KeyboardEvent('keydown', {key: 'Delete', bubbles: true})
            timeline.dispatchEvent(keyEvent)

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.index).toBe(2)
        })


        test('dispatches framedelete event on Backspace key', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)
            timeline.setCurrentIndex(1)

            const handler = vi.fn()
            timeline.addEventListener('framedelete', handler)

            const keyEvent = new KeyboardEvent('keydown', {key: 'Backspace', bubbles: true})
            timeline.dispatchEvent(keyEvent)

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.index).toBe(1)
        })

    })


    describe('touch drag handlers', () => {

        test('handleTouchDragOver adds drag-over class and updates drop indicator', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            timeline.handleTouchDragOver(100)

            const timelineEl = timeline.shadowRoot.querySelector('.timeline')
            expect(timelineEl.classList.contains('drag-over')).toBe(true)

            const dropIndicator = timeline.shadowRoot.querySelector('.drop-indicator')
            expect(dropIndicator.classList.contains('visible')).toBe(true)
        })


        test('handleTouchDrop dispatches framedrop event and removes drag-over class', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            timeline.handleTouchDragOver(100)

            const handler = vi.fn()
            timeline.addEventListener('framedrop', handler)

            timeline.handleTouchDrop({
                name: 'walk/1',
                regionData: {x: 0, y: 0, width: 32, height: 32}
            })

            const timelineEl = timeline.shadowRoot.querySelector('.timeline')
            expect(timelineEl.classList.contains('drag-over')).toBe(false)
            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.frameName).toBe('walk/1')
        })


        test('handleTouchDragLeave removes drag-over class and hides drop indicator', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            timeline.handleTouchDragOver(100)

            const timelineEl = timeline.shadowRoot.querySelector('.timeline')
            expect(timelineEl.classList.contains('drag-over')).toBe(true)

            timeline.handleTouchDragLeave()

            expect(timelineEl.classList.contains('drag-over')).toBe(false)

            const dropIndicator = timeline.shadowRoot.querySelector('.drop-indicator')
            expect(dropIndicator.classList.contains('visible')).toBe(false)
        })

    })


    describe('flashMovedFrame', () => {

        test('adds just-moved class to frame at specified index', async () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            timeline.flashMovedFrame(1)

            // Wait for requestAnimationFrame
            await new Promise(resolve => requestAnimationFrame(resolve))

            const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
            expect(frameEls[1].classList.contains('just-moved')).toBe(true)
        })


        test('does not throw if index is out of bounds', async () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            expect(() => timeline.flashMovedFrame(100)).not.toThrow()

            // Wait for requestAnimationFrame
            await new Promise(resolve => requestAnimationFrame(resolve))
        })


        test('does not throw if no frames exist', async () => {
            expect(() => timeline.flashMovedFrame(0)).not.toThrow()

            // Wait for requestAnimationFrame
            await new Promise(resolve => requestAnimationFrame(resolve))
        })

    })

})
