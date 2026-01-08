import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import AudioSystemInspector from './audio_system_inspector.js'
import Notifier from '../../core/notifier.js'


class MockAudioSystem extends Notifier {

    constructor (options = {}) {
        super()
        this.unlocked = options.unlocked ?? false
        this.masterVolume = options.masterVolume ?? 1
        this._channels = options.channels ?? ['music', 'sfx']
    }


    listChannels () {
        return this._channels
    }


    setVolume (value) {
        this.masterVolume = value
        this.emit('volume:changed', value)
    }


    unlock () {
        this.unlocked = true
        this.emit('audio:unlocked')
    }

}


describe('AudioSystemInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('audio-system-inspector')
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


        test('has unlock button in actions', () => {
            const btn = inspector.actionsEl.querySelector('button')
            expect(btn).not.toBeNull()
        })


        test('has volume input', () => {
            const volumeInput = inspector.shadowRoot.querySelector('slider-input')
            expect(volumeInput).not.toBeNull()
        })

    })


    test('matches static matches method exists', () => {
        expect(typeof AudioSystemInspector.matches).toBe('function')
    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockAudioSystem()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('displays unlocked status when module is set', () => {
            const module = new MockAudioSystem({unlocked: true})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasUnlocked = Array.from(values).some(v => v.textContent === 'true')
            expect(hasUnlocked).toBe(true)
        })


        test('displays channels when module is set', () => {
            const module = new MockAudioSystem({channels: ['music', 'sfx', 'ambiance']})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasChannels = Array.from(values).some(v => v.textContent.includes('music'))
            expect(hasChannels).toBe(true)
        })

    })


    describe('unlocked status display', () => {

        test('shows false when not unlocked', () => {
            const module = new MockAudioSystem({unlocked: false})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'false')
            expect(hasStatus).toBe(true)
        })


        test('shows true when unlocked', () => {
            const module = new MockAudioSystem({unlocked: true})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'true')
            expect(hasStatus).toBe(true)
        })


        test('applies accent class when unlocked', () => {
            const module = new MockAudioSystem({unlocked: true})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value.accent')
            expect(values.length).toBeGreaterThan(0)
        })

    })


    describe('unlock button', () => {

        test('is visible when not unlocked', () => {
            const module = new MockAudioSystem({unlocked: false})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn.style.display).not.toBe('none')
        })


        test('is hidden when unlocked', () => {
            const module = new MockAudioSystem({unlocked: true})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn.style.display).toBe('none')
        })


        test('calls unlock when clicked', () => {
            const module = new MockAudioSystem({unlocked: false})
            module.unlock = vi.fn()
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            btn.click()

            expect(module.unlock).toHaveBeenCalled()
        })

    })


    describe('volume input', () => {

        test('displays initial volume', () => {
            const module = new MockAudioSystem({masterVolume: 0.5})
            inspector.setModule(module)

            const volumeInput = inspector.shadowRoot.querySelector('slider-input')
            expect(volumeInput.value).toBe(0.5)
        })


        test('calls setVolume when changed', () => {
            const module = new MockAudioSystem()
            module.setVolume = vi.fn()
            inspector.setModule(module)

            const volumeInput = inspector.shadowRoot.querySelector('slider-input')
            volumeInput.dispatchEvent(new CustomEvent('change', {detail: {value: 0.7}}))

            expect(module.setVolume).toHaveBeenCalledWith(0.7)
        })

    })


    describe('event binding', () => {

        test('updates unlocked status on audio:unlocked event', () => {
            const module = new MockAudioSystem({unlocked: false})
            inspector.setModule(module)

            module.unlocked = true
            module.emit('audio:unlocked')

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'true')
            expect(hasStatus).toBe(true)
        })


        test('updates volume on volume:changed event', () => {
            const module = new MockAudioSystem({masterVolume: 1})
            inspector.setModule(module)

            module.masterVolume = 0.3
            module.emit('volume:changed', 0.3)

            const volumeInput = inspector.shadowRoot.querySelector('slider-input')
            expect(volumeInput.value).toBe(0.3)
        })


        test('updates channels on child:added event', () => {
            const module = new MockAudioSystem({channels: ['music']})
            inspector.setModule(module)

            module._channels = ['music', 'sfx']
            module.emit('child:added')

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasChannels = Array.from(values).some(v => v.textContent.includes('2'))
            expect(hasChannels).toBe(true)
        })


        test('cleans listeners when module changes', () => {
            const module1 = new MockAudioSystem({unlocked: false})
            inspector.setModule(module1)

            const module2 = new MockAudioSystem({unlocked: false})
            inspector.setModule(module2)

            module1.emit('audio:unlocked')

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'false')
            expect(hasStatus).toBe(true)
        })

    })

})
