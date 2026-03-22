import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import GameLoopInspector from './game_loop_inspector.js'
import Notifier from '../../core/notifier.js'


class MockGameLoop extends Notifier {

    #currentFps
    #screenFps

    constructor (options = {}) {
        super()
        this.fps = options.fps ?? 60
        this.started = options.started ?? false
        this.paused = options.paused ?? false
        this.#currentFps = options.currentFps ?? 0
        this.#screenFps = options.screenFps ?? 0
        this.fpsLimited = options.fpsLimited ?? false
    }


    getCurrentFps () {
        return this.#currentFps
    }


    getScreenFps () {
        return this.#screenFps
    }


    setFps () {}


    setFpsLimited () {}


    pause () {
        this.paused = true
        this.emit('pause')
    }


    resume () {
        this.paused = false
        this.emit('resume')
    }

}


describe('GameLoopInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('game-loop-inspector')
        container.appendChild(inspector)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(inspector).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(inspector.shadowRoot).not.toBeNull()
        })


        test('has gridEl after buildDOM', () => {
            expect(inspector.gridEl).not.toBeNull()
        })


        test('has toggle button in actions', () => {
            const btn = inspector.actionsEl.querySelector('button')
            expect(btn).not.toBeNull()
        })

    })


    test('matches static matches method exists', () => {
        expect(typeof GameLoopInspector.matches).toBe('function')
    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockGameLoop()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('displays fps when module is set', () => {
            const module = new MockGameLoop({currentFps: 59})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasFps = Array.from(values).some(v => v.textContent === '59')
            expect(hasFps).toBe(true)
        })

    })


    describe('status display', () => {

        test('shows stopped when not started', () => {
            const module = new MockGameLoop({started: false})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'stopped')
            expect(hasStatus).toBe(true)
        })


        test('shows running when started and not paused', () => {
            const module = new MockGameLoop({started: true, paused: false})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'running')
            expect(hasStatus).toBe(true)
        })


        test('shows paused when started and paused', () => {
            const module = new MockGameLoop({started: true, paused: true})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'paused')
            expect(hasStatus).toBe(true)
        })

    })


    describe('toggle button', () => {

        test('is disabled when not started', () => {
            const module = new MockGameLoop({started: false})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn.disabled).toBe(true)
        })


        test('shows Pause when running', () => {
            const module = new MockGameLoop({started: true, paused: false})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn.textContent).toContain('Pause')
        })


        test('shows Resume when paused', () => {
            const module = new MockGameLoop({started: true, paused: true})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn.textContent).toContain('Resume')
        })


        test('calls pause when clicked while running', () => {
            const module = new MockGameLoop({started: true, paused: false})
            module.pause = vi.fn()
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            btn.click()

            expect(module.pause).toHaveBeenCalled()
        })


        test('calls resume when clicked while paused', () => {
            const module = new MockGameLoop({started: true, paused: true})
            module.resume = vi.fn()
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            btn.click()

            expect(module.resume).toHaveBeenCalled()
        })

    })


    describe('fps limit checkbox', () => {

        test('checkbox reflects fpsLimited state', () => {
            const module = new MockGameLoop({fpsLimited: true})
            inspector.setModule(module)

            const checkbox = inspector.gridEl.querySelector('.fps-limit-checkbox')
            expect(checkbox.checked).toBe(true)
        })


        test('calls setFpsLimited when checkbox changes', () => {
            const module = new MockGameLoop({fpsLimited: false})
            module.setFpsLimited = vi.fn()
            inspector.setModule(module)

            const checkbox = inspector.gridEl.querySelector('.fps-limit-checkbox')
            checkbox.checked = true
            checkbox.dispatchEvent(new Event('change'))

            expect(module.setFpsLimited).toHaveBeenCalledWith(true)
        })


        test('slider is disabled when fps is not limited', () => {
            const module = new MockGameLoop({fpsLimited: false})
            inspector.setModule(module)

            const slider = inspector.gridEl.querySelector('.fps-slider')
            expect(slider.disabled).toBe(true)
        })


        test('slider is enabled when fps is limited', () => {
            const module = new MockGameLoop({fpsLimited: true})
            inspector.setModule(module)

            const slider = inspector.gridEl.querySelector('.fps-slider')
            expect(slider.disabled).toBe(false)
        })

    })


    describe('fps slider', () => {

        test('slider reflects module fps value', () => {
            const module = new MockGameLoop({fps: 30})
            inspector.setModule(module)

            const slider = inspector.gridEl.querySelector('.fps-slider')
            expect(slider.value).toBe('30')
        })


        test('slider value label shows fps', () => {
            const module = new MockGameLoop({fps: 45})
            inspector.setModule(module)

            const valueLabel = inspector.gridEl.querySelector('.fps-slider-value')
            expect(valueLabel.textContent).toBe('45')
        })


        test('calls setFps when slider changes', () => {
            const module = new MockGameLoop({fpsLimited: true, fps: 60})
            module.setFps = vi.fn()
            inspector.setModule(module)

            const slider = inspector.gridEl.querySelector('.fps-slider')
            slider.value = '90'
            slider.dispatchEvent(new Event('input'))

            expect(module.setFps).toHaveBeenCalledWith(90)
        })

    })


    describe('event binding', () => {

        test('updates status on pause event', () => {
            const module = new MockGameLoop({started: true, paused: false})
            inspector.setModule(module)

            module.paused = true
            module.emit('pause')

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'paused')
            expect(hasStatus).toBe(true)
        })


        test('updates status on resume event', () => {
            const module = new MockGameLoop({started: true, paused: true})
            inspector.setModule(module)

            module.paused = false
            module.emit('resume')

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'running')
            expect(hasStatus).toBe(true)
        })


        test('updates fps on render event', () => {
            const module = new MockGameLoop({started: true, currentFps: 30})
            inspector.setModule(module)

            module.emit('render', null, 55, 60)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasFps = Array.from(values).some(v => v.textContent === '55')
            expect(hasFps).toBe(true)
        })


        test('updates slider on changed:fps event', () => {
            const module = new MockGameLoop({fps: 60})
            inspector.setModule(module)

            module.emit('changed:fps', 120)

            const slider = inspector.gridEl.querySelector('.fps-slider')
            expect(slider.value).toBe('120')
        })


        test('updates checkbox on changed:fpsLimited event', () => {
            const module = new MockGameLoop({fpsLimited: false})
            inspector.setModule(module)

            module.fpsLimited = true
            module.emit('changed:fpsLimited', true)

            const checkbox = inspector.gridEl.querySelector('.fps-limit-checkbox')
            expect(checkbox.checked).toBe(true)
        })


        test('cleans listeners when module changes', () => {
            const module1 = new MockGameLoop({started: true})
            inspector.setModule(module1)

            const module2 = new MockGameLoop({started: false})
            inspector.setModule(module2)

            module1.emit('pause')

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'stopped')
            expect(hasStatus).toBe(true)
        })

    })

})
