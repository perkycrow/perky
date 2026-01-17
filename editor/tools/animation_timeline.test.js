import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './animation_timeline.js'


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

        test('should extend HTMLElement', () => {
            expect(timeline).toBeInstanceOf(HTMLElement)
        })


        test('should have shadow DOM', () => {
            expect(timeline.shadowRoot).not.toBeNull()
        })


        test('should render timeline container', () => {
            const timelineEl = timeline.shadowRoot.querySelector('.timeline')
            expect(timelineEl).not.toBeNull()
        })


        test('should be empty initially', () => {
            const frames = timeline.shadowRoot.querySelectorAll('.frame')
            expect(frames.length).toBe(0)
        })

    })


    describe('setFrames', () => {

        test('should render frames', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
            expect(frameEls.length).toBe(4)
        })


        test('should render frame indices', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const indexEls = timeline.shadowRoot.querySelectorAll('.frame-index')
            expect(indexEls[0].textContent).toBe('0')
            expect(indexEls[1].textContent).toBe('1')
            expect(indexEls[2].textContent).toBe('2')
            expect(indexEls[3].textContent).toBe('3')
        })


        test('should render frame thumbnails', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const canvases = timeline.shadowRoot.querySelectorAll('.frame-thumbnail')
            expect(canvases.length).toBe(4)
            expect(canvases[0].width).toBe(48)
            expect(canvases[0].height).toBe(48)
        })


        test('should render events when present', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const eventsEls = timeline.shadowRoot.querySelectorAll('.frame-events')
            expect(eventsEls.length).toBe(2)
            expect(eventsEls[0].textContent).toBe('hit')
            expect(eventsEls[1].textContent).toBe('end')
        })


        test('should render duration inputs for all frames', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const durationInputs = timeline.shadowRoot.querySelectorAll('.frame-duration-input')
            expect(durationInputs.length).toBe(4)
        })


        test('should clear previous frames when setting new ones', () => {
            timeline.setFrames([{region: null}, {region: null}])
            expect(timeline.shadowRoot.querySelectorAll('.frame').length).toBe(2)

            timeline.setFrames([{region: null}])
            expect(timeline.shadowRoot.querySelectorAll('.frame').length).toBe(1)
        })

    })


    describe('setCurrentIndex', () => {

        test('should highlight active frame', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            timeline.setCurrentIndex(2)

            const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
            expect(frameEls[0].classList.contains('active')).toBe(false)
            expect(frameEls[1].classList.contains('active')).toBe(false)
            expect(frameEls[2].classList.contains('active')).toBe(true)
            expect(frameEls[3].classList.contains('active')).toBe(false)
        })


        test('should update highlight when index changes', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            timeline.setCurrentIndex(1)
            timeline.setCurrentIndex(3)

            const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
            expect(frameEls[1].classList.contains('active')).toBe(false)
            expect(frameEls[3].classList.contains('active')).toBe(true)
        })


        test('should not update if index is the same', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            timeline.setCurrentIndex(1)
            const frameEl = timeline.shadowRoot.querySelectorAll('.frame')[1]

            timeline.setCurrentIndex(1)

            expect(frameEl.classList.contains('active')).toBe(true)
        })

    })


    describe('events', () => {

        test('should dispatch frameclick event on frame click', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const handler = vi.fn()
            timeline.addEventListener('frameclick', handler)

            const frameEl = timeline.shadowRoot.querySelectorAll('.frame')[2]
            frameEl.click()

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.index).toBe(2)
        })


        test('should dispatch correct index for each frame', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const indices = []
            timeline.addEventListener('frameclick', (e) => {
                indices.push(e.detail.index)
            })

            const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
            frameEls[0].click()
            frameEls[3].click()
            frameEls[1].click()

            expect(indices).toEqual([0, 3, 1])
        })

    })


    test('should set data-index on frames', () => {
        const frames = createMockFrames()
        timeline.setFrames(frames)

        const frameEls = timeline.shadowRoot.querySelectorAll('.frame')
        expect(frameEls[0].dataset.index).toBe('0')
        expect(frameEls[1].dataset.index).toBe('1')
        expect(frameEls[2].dataset.index).toBe('2')
        expect(frameEls[3].dataset.index).toBe('3')
    })


    describe('drop zone', () => {

        test('should have drop indicator element', () => {
            const dropIndicator = timeline.shadowRoot.querySelector('.drop-indicator')
            expect(dropIndicator).not.toBeNull()
        })


        test('should dispatch framedrop event on spritesheet drop', () => {
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


        test('should add drag-over class during dragover', () => {
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

        test('should make frames draggable', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const frame = timeline.shadowRoot.querySelector('.frame')
            expect(frame.draggable).toBe(true)
        })


        test('should add dragging class on dragstart', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const frame = timeline.shadowRoot.querySelector('.frame')

            const dragStartEvent = new Event('dragstart', {bubbles: true})
            dragStartEvent.dataTransfer = createMockDataTransfer()
            frame.dispatchEvent(dragStartEvent)

            expect(frame.classList.contains('dragging')).toBe(true)
        })


        test('should dispatch framemove event on timeline drop', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const handler = vi.fn()
            timeline.addEventListener('framemove', handler)

            const timelineEl = timeline.shadowRoot.querySelector('.timeline')

            const dragOverDataTransfer = createMockDataTransfer()
            dragOverDataTransfer.setData('application/x-timeline-frame', '{}')
            const dragOverEvent = new Event('dragover', {bubbles: true, cancelable: true})
            dragOverEvent.dataTransfer = dragOverDataTransfer
            dragOverEvent.clientX = 200
            timelineEl.dispatchEvent(dragOverEvent)

            const dropDataTransfer = createMockDataTransfer()
            dropDataTransfer.setData('application/x-timeline-frame', JSON.stringify({
                sourceIndex: 0
            }))
            const dropEvent = new Event('drop', {bubbles: true, cancelable: true})
            dropEvent.dataTransfer = dropDataTransfer
            timelineEl.dispatchEvent(dropEvent)

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.fromIndex).toBe(0)
        })

    })


    describe('frame deletion', () => {

        test('should have delete button on frames', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const deleteBtn = timeline.shadowRoot.querySelector('.frame-delete')
            expect(deleteBtn).not.toBeNull()
        })


        test('should dispatch framedelete event on delete button click', () => {
            const frames = createMockFrames()
            timeline.setFrames(frames)

            const handler = vi.fn()
            timeline.addEventListener('framedelete', handler)

            const deleteBtn = timeline.shadowRoot.querySelectorAll('.frame-delete')[1]
            deleteBtn.click()

            expect(handler).toHaveBeenCalled()
            expect(handler.mock.calls[0][0].detail.index).toBe(1)
        })


        test('should dispatch framedelete event on Delete key', () => {
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


        test('should dispatch framedelete event on Backspace key', () => {
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

})
