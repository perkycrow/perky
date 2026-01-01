import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import GameLoopInspector from './game_loop_inspector.js'
import Notifier from '../../core/notifier.js'


class MockGameLoop extends Notifier {

    constructor (options = {}) {
        super()
        this.fps = options.fps ?? 60
        this.started = options.started ?? false
        this.paused = options.paused ?? false
        this._currentFps = options.currentFps ?? 0
    }


    getCurrentFps () {
        return this._currentFps
    }


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
