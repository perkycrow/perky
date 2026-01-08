import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import AudioChannelInspector from './audio_channel_inspector.js'
import Notifier from '../../core/notifier.js'


class MockAudioChannel extends Notifier {

    constructor (options = {}) {
        super()
        this.volume = options.volume ?? 1
        this.muted = options.muted ?? false
        this.sourceCount = options.sourceCount ?? 0
    }


    setVolume (value) {
        this.volume = value
        this.emit('volume:changed', value)
    }


    mute () {
        this.muted = true
        this.emit('muted')
    }


    unmute () {
        this.muted = false
        this.emit('unmuted')
    }


    toggleMute () {
        if (this.muted) {
            this.unmute()
        } else {
            this.mute()
        }
    }

}


describe('AudioChannelInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('audio-channel-inspector')
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


        test('has mute button in actions', () => {
            const btn = inspector.actionsEl.querySelector('button')
            expect(btn).not.toBeNull()
        })


        test('has volume input', () => {
            const volumeInput = inspector.shadowRoot.querySelector('slider-input')
            expect(volumeInput).not.toBeNull()
        })

    })


    test('matches static matches method exists', () => {
        expect(typeof AudioChannelInspector.matches).toBe('function')
    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockAudioChannel()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('displays muted status when module is set', () => {
            const module = new MockAudioChannel({muted: true})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasMuted = Array.from(values).some(v => v.textContent === 'true')
            expect(hasMuted).toBe(true)
        })


        test('displays source count when module is set', () => {
            const module = new MockAudioChannel({sourceCount: 5})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasSources = Array.from(values).some(v => v.textContent === '5')
            expect(hasSources).toBe(true)
        })

    })


    describe('muted status display', () => {

        test('shows false when not muted', () => {
            const module = new MockAudioChannel({muted: false})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'false')
            expect(hasStatus).toBe(true)
        })


        test('shows true when muted', () => {
            const module = new MockAudioChannel({muted: true})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'true')
            expect(hasStatus).toBe(true)
        })


        test('applies accent class when muted', () => {
            const module = new MockAudioChannel({muted: true})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value.accent')
            expect(values.length).toBeGreaterThan(0)
        })

    })


    describe('source count display', () => {

        test('applies accent class when sources are active', () => {
            const module = new MockAudioChannel({sourceCount: 3})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value.accent')
            expect(values.length).toBeGreaterThan(0)
        })


        test('no accent class when no sources', () => {
            const module = new MockAudioChannel({sourceCount: 0})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const sourceValue = Array.from(values).find(v => v.textContent === '0')
            expect(sourceValue?.classList.contains('accent')).toBe(false)
        })

    })


    describe('mute button', () => {

        test('shows Mute when not muted', () => {
            const module = new MockAudioChannel({muted: false})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn.textContent).toContain('Mute')
        })


        test('shows Unmute when muted', () => {
            const module = new MockAudioChannel({muted: true})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn.textContent).toContain('Unmute')
        })


        test('has primary class when muted', () => {
            const module = new MockAudioChannel({muted: true})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn.classList.contains('primary')).toBe(true)
        })


        test('no primary class when not muted', () => {
            const module = new MockAudioChannel({muted: false})
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            expect(btn.classList.contains('primary')).toBe(false)
        })


        test('calls toggleMute when clicked', () => {
            const module = new MockAudioChannel({muted: false})
            module.toggleMute = vi.fn()
            inspector.setModule(module)

            const btn = inspector.actionsEl.querySelector('button')
            btn.click()

            expect(module.toggleMute).toHaveBeenCalled()
        })

    })


    describe('volume input', () => {

        test('displays initial volume', () => {
            const module = new MockAudioChannel({volume: 0.8})
            inspector.setModule(module)

            const volumeInput = inspector.shadowRoot.querySelector('slider-input')
            expect(volumeInput.value).toBe(0.8)
        })


        test('calls setVolume when changed', () => {
            const module = new MockAudioChannel()
            module.setVolume = vi.fn()
            inspector.setModule(module)

            const volumeInput = inspector.shadowRoot.querySelector('slider-input')
            volumeInput.dispatchEvent(new CustomEvent('change', {detail: {value: 0.4}}))

            expect(module.setVolume).toHaveBeenCalledWith(0.4)
        })

    })


    describe('event binding', () => {

        test('updates muted status on muted event', () => {
            const module = new MockAudioChannel({muted: false})
            inspector.setModule(module)

            module.muted = true
            module.emit('muted')

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'true')
            expect(hasStatus).toBe(true)
        })


        test('updates muted status on unmuted event', () => {
            const module = new MockAudioChannel({muted: true})
            inspector.setModule(module)

            module.muted = false
            module.emit('unmuted')

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'false')
            expect(hasStatus).toBe(true)
        })


        test('updates volume on volume:changed event', () => {
            const module = new MockAudioChannel({volume: 1})
            inspector.setModule(module)

            module.volume = 0.6
            module.emit('volume:changed', 0.6)

            const volumeInput = inspector.shadowRoot.querySelector('slider-input')
            expect(volumeInput.value).toBe(0.6)
        })


        test('updates sources on source:added event', () => {
            const module = new MockAudioChannel({sourceCount: 1})
            inspector.setModule(module)

            module.sourceCount = 2
            module.emit('source:added')

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasSources = Array.from(values).some(v => v.textContent === '2')
            expect(hasSources).toBe(true)
        })


        test('cleans listeners when module changes', () => {
            const module1 = new MockAudioChannel({muted: false})
            inspector.setModule(module1)

            const module2 = new MockAudioChannel({muted: false})
            inspector.setModule(module2)

            module1.emit('muted')

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasStatus = Array.from(values).some(v => v.textContent === 'false')
            expect(hasStatus).toBe(true)
        })

    })

})
