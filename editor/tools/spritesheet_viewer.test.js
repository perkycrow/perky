import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './spritesheet_viewer.js'


function createMockSpritesheet () {
    const framesMap = new Map([
        ['walk/1', {region: {width: 32, height: 32, x: 0, y: 0, image: null}}],
        ['walk/2', {region: {width: 32, height: 32, x: 32, y: 0, image: null}}],
        ['jump/1', {region: {width: 32, height: 32, x: 0, y: 32, image: null}}],
        ['jump/2', {region: {width: 32, height: 32, x: 32, y: 32, image: null}}]
    ])

    return {
        framesMap,
        listAnimations: () => ['walk', 'jump'],
        getAnimation: (name) => {
            if (name === 'walk') {
                return ['walk/1', 'walk/2']
            }
            if (name === 'jump') {
                return ['jump/1', 'jump/2']
            }
            return null
        }
    }
}


describe('SpritesheetViewer', () => {

    let viewer
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        viewer = document.createElement('spritesheet-viewer')
        container.appendChild(viewer)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(viewer).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(viewer.shadowRoot).not.toBeNull()
        })


        test('renders filter select', () => {
            const select = viewer.shadowRoot.querySelector('.filter-select')
            expect(select).not.toBeNull()
        })


        test('renders frame grid', () => {
            const grid = viewer.shadowRoot.querySelector('.frame-grid')
            expect(grid).not.toBeNull()
        })


        test('is empty initially', () => {
            const frames = viewer.shadowRoot.querySelectorAll('.frame')
            expect(frames.length).toBe(0)
        })

    })


    describe('setSpritesheet', () => {

        test('renders all frames', () => {
            const spritesheet = createMockSpritesheet()
            viewer.setSpritesheet(spritesheet)

            const frames = viewer.shadowRoot.querySelectorAll('.frame')
            expect(frames.length).toBe(4)
        })


        test('populates filter with animations', () => {
            const spritesheet = createMockSpritesheet()
            viewer.setSpritesheet(spritesheet)

            const options = viewer.shadowRoot.querySelectorAll('.filter-select option')
            expect(options.length).toBe(3)
            expect(options[0].textContent).toBe('All frames')
            expect(options[1].textContent).toBe('walk')
            expect(options[2].textContent).toBe('jump')
        })


        test('renders frame thumbnails', () => {
            const spritesheet = createMockSpritesheet()
            viewer.setSpritesheet(spritesheet)

            const canvases = viewer.shadowRoot.querySelectorAll('.frame-thumbnail')
            expect(canvases.length).toBe(4)
            expect(canvases[0].width).toBe(100)
            expect(canvases[0].height).toBe(100)
        })


        test('renders full frame names', () => {
            const spritesheet = createMockSpritesheet()
            viewer.setSpritesheet(spritesheet)

            const names = viewer.shadowRoot.querySelectorAll('.frame-name')
            expect(names[0].textContent).toBe('walk/1')
            expect(names[2].textContent).toBe('jump/1')
        })


        test('sets full name as title on frame element', () => {
            const spritesheet = createMockSpritesheet()
            viewer.setSpritesheet(spritesheet)

            const frames = viewer.shadowRoot.querySelectorAll('.frame')
            expect(frames[0].title).toBe('walk/1')
        })

    })


    describe('filtering', () => {

        test('filters frames by animation', () => {
            const spritesheet = createMockSpritesheet()
            viewer.setSpritesheet(spritesheet)

            const select = viewer.shadowRoot.querySelector('.filter-select')
            select.value = 'walk'
            select.dispatchEvent(new Event('change'))

            const frames = viewer.shadowRoot.querySelectorAll('.frame')
            expect(frames.length).toBe(2)
            expect(frames[0].dataset.name).toBe('walk/1')
            expect(frames[1].dataset.name).toBe('walk/2')
        })


        test('shows all frames when filter cleared', () => {
            const spritesheet = createMockSpritesheet()
            viewer.setSpritesheet(spritesheet)

            const select = viewer.shadowRoot.querySelector('.filter-select')

            select.value = 'walk'
            select.dispatchEvent(new Event('change'))
            expect(viewer.shadowRoot.querySelectorAll('.frame').length).toBe(2)

            select.value = ''
            select.dispatchEvent(new Event('change'))
            expect(viewer.shadowRoot.querySelectorAll('.frame').length).toBe(4)
        })

    })


    test('dispatches frameclick event on frame click', () => {
        const spritesheet = createMockSpritesheet()
        viewer.setSpritesheet(spritesheet)

        const handler = vi.fn()
        viewer.addEventListener('frameclick', handler)

        const frameEl = viewer.shadowRoot.querySelector('.frame')
        frameEl.click()

        expect(handler).toHaveBeenCalled()
        expect(handler.mock.calls[0][0].detail.name).toBe('walk/1')
        expect(handler.mock.calls[0][0].detail.region).toBeDefined()
    })


    test('sets data-name on frames', () => {
        const spritesheet = createMockSpritesheet()
        viewer.setSpritesheet(spritesheet)

        const frames = viewer.shadowRoot.querySelectorAll('.frame')
        expect(frames[0].dataset.name).toBe('walk/1')
        expect(frames[1].dataset.name).toBe('walk/2')
    })



})
