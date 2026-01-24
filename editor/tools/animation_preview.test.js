import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './animation_preview.js'


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


        test('renders preview container', () => {
            const containerEl = preview.shadowRoot.querySelector('.preview-container')
            expect(containerEl).not.toBeNull()
        })


        test('renders preview area', () => {
            const previewArea = preview.shadowRoot.querySelector('.preview-area')
            expect(previewArea).not.toBeNull()
        })


        test('renders preview canvas', () => {
            const canvas = preview.shadowRoot.querySelector('.preview-canvas')
            expect(canvas).not.toBeNull()
            expect(canvas.tagName).toBe('CANVAS')
        })


        test('renders scenery canvas', () => {
            const canvas = preview.shadowRoot.querySelector('.scenery-canvas')
            expect(canvas).not.toBeNull()
        })


        test('renders grid canvas', () => {
            const canvas = preview.shadowRoot.querySelector('.grid-canvas')
            expect(canvas).not.toBeNull()
        })


        test('renders game preview canvas', () => {
            const canvas = preview.shadowRoot.querySelector('.game-preview-canvas')
            expect(canvas).not.toBeNull()
        })

    })


    describe('controls', () => {

        test('renders preview controls', () => {
            const controls = preview.shadowRoot.querySelector('.preview-controls')
            expect(controls).not.toBeNull()
        })


        test('renders play button', () => {
            const playBtn = preview.shadowRoot.querySelector('.play-btn')
            expect(playBtn).not.toBeNull()
        })


        test('renders stop button', () => {
            const stopBtn = preview.shadowRoot.querySelector('.stop-btn')
            expect(stopBtn).not.toBeNull()
        })


        test('renders settings button', () => {
            const settingsBtn = preview.shadowRoot.querySelector('.settings-btn')
            expect(settingsBtn).not.toBeNull()
        })


        test('renders scenery button', () => {
            const sceneryBtn = preview.shadowRoot.querySelector('.scenery-btn')
            expect(sceneryBtn).not.toBeNull()
        })


        test('renders grid button', () => {
            const gridBtn = preview.shadowRoot.querySelector('.grid-btn')
            expect(gridBtn).not.toBeNull()
        })

    })


    describe('zoom controls', () => {

        test('renders zoom controls container', () => {
            const zoomControls = preview.shadowRoot.querySelector('.zoom-controls')
            expect(zoomControls).not.toBeNull()
        })


        test('renders zoom toggle button', () => {
            const zoomToggle = preview.shadowRoot.querySelector('.zoom-toggle')
            expect(zoomToggle).not.toBeNull()
        })


        test('renders zoom slider', () => {
            const zoomSlider = preview.shadowRoot.querySelector('.zoom-slider')
            expect(zoomSlider).not.toBeNull()
            expect(zoomSlider.type).toBe('range')
        })


        test('zoom slider has correct range', () => {
            const zoomSlider = preview.shadowRoot.querySelector('.zoom-slider')
            expect(zoomSlider.min).toBe('0.1')
            expect(zoomSlider.max).toBe('1')
        })

    })


    describe('currentIndex', () => {

        test('returns 0 when no animation', () => {
            expect(preview.currentIndex).toBe(0)
        })

    })


    describe('isPlaying', () => {

        test('returns false initially', () => {
            expect(preview.isPlaying).toBe(false)
        })

    })


    describe('setMotion', () => {

        test('accepts motion config', () => {
            expect(() => preview.setMotion({enabled: true, speed: 1})).not.toThrow()
        })


        test('accepts null motion', () => {
            expect(() => preview.setMotion(null)).not.toThrow()
        })

    })


    describe('updateMotion', () => {

        test('accepts motion updates', () => {
            expect(() => preview.updateMotion({speed: 2})).not.toThrow()
        })

    })


    describe('setAnchor', () => {

        test('accepts anchor config', () => {
            expect(() => preview.setAnchor({x: 0.5, y: 0.5})).not.toThrow()
        })


        test('accepts null anchor', () => {
            expect(() => preview.setAnchor(null)).not.toThrow()
        })

    })


    describe('setUnitsInView', () => {

        test('accepts units config', () => {
            expect(() => preview.setUnitsInView({width: 10, height: 8})).not.toThrow()
        })

    })


    describe('setSize', () => {

        test('accepts size config', () => {
            expect(() => preview.setSize({width: 32, height: 48})).not.toThrow()
        })

    })


    describe('setBackgroundRegion', () => {

        test('accepts region config', () => {
            expect(() => preview.setBackgroundRegion({x: 0, y: 0, width: 256, height: 256})).not.toThrow()
        })

    })


    describe('events', () => {

        test('dispatches settingsrequest on settings button click', () => {
            const handler = vi.fn()
            preview.addEventListener('settingsrequest', handler)

            const settingsBtn = preview.shadowRoot.querySelector('.settings-btn')
            settingsBtn.click()

            expect(handler).toHaveBeenCalled()
        })


        test('dispatches stop on stop button click', () => {
            const handler = vi.fn()
            preview.addEventListener('stop', handler)

            const stopBtn = preview.shadowRoot.querySelector('.stop-btn')
            stopBtn.click()

            expect(handler).toHaveBeenCalled()
        })

    })


    describe('play', () => {

        test('does not throw without animation', () => {
            expect(() => preview.play()).not.toThrow()
        })

    })


    describe('pause', () => {

        test('does not throw without animation', () => {
            expect(() => preview.pause()).not.toThrow()
        })

    })


    describe('stop', () => {

        test('does not throw without animation', () => {
            expect(() => preview.stop()).not.toThrow()
        })

    })


    describe('setAnimation', () => {

        test('accepts null animation', () => {
            expect(() => preview.setAnimation(null)).not.toThrow()
        })

    })


    describe('setCurrentIndex', () => {

        test('does not throw without animation', () => {
            expect(() => preview.setCurrentIndex(0)).not.toThrow()
        })

    })

})
